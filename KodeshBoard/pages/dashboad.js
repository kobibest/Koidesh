import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Settings } from "@/entities/Settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { UploadFile } from "@/integrations/Core";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    synagogueName: "",
    logo: "",
    nusach: "ספרד",
    bottomMarqueeText: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Get user data
      const userData = await User.me();
      
      // Get all settings
      const allSettings = await Settings.list();
      
      // Process settings
      const synagogueNameSetting = allSettings.find(s => s.key === "synagogue_name");
      const logoSetting = allSettings.find(s => s.key === "logo");
      const nusachSetting = allSettings.find(s => s.key === "nusach");
      const marqueeTextSetting = allSettings.find(s => s.key === "bottom_marquee_text");
      
      setSettings({
        synagogueName: synagogueNameSetting?.value?.text || "",
        logo: logoSetting?.value?.url || "",
        nusach: nusachSetting?.value?.text || "ספרד",
        bottomMarqueeText: marqueeTextSetting?.value?.text || ""
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת נתונים",
        description: "לא ניתן היה לטעון את הגדרות בית הכנסת"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Get user data
      const userData = await User.me();
      
      // Save synagogue name
      await saveSetting("synagogue_name", { text: settings.synagogueName });
      
      // Save logo
      await saveSetting("logo", { url: settings.logo });
      
      // Save nusach
      await saveSetting("nusach", { text: settings.nusach });
      
      // Save marquee text
      await saveSetting("bottom_marquee_text", { text: settings.bottomMarqueeText });
      
      toast({
        title: "נשמר בהצלחה",
        description: "הגדרות בית הכנסת נשמרו בהצלחה"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בשמירה",
        description: "לא ניתן היה לשמור את הגדרות בית הכנסת"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveSetting = async (key, value) => {
    // Check if setting exists
    const existingSettings = await Settings.filter({ key });
    
    if (existingSettings.length > 0) {
      // Update existing setting
      await Settings.update(existingSettings[0].id, {
        key,
        value
      });
    } else {
      // Create new setting
      await Settings.create({
        key,
        value
      });
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "סוג קובץ לא תקין",
        description: "נא להעלות קובץ תמונה בלבד"
      });
      return;
    }
    
    try {
      setIsSaving(true);
      const { file_url } = await UploadFile({ file });
      setSettings(prev => ({
        ...prev,
        logo: file_url
      }));
      
      // Save the logo setting right away
      await saveSetting("logo", { url: file_url });
      
      toast({
        title: "הלוגו הועלה בהצלחה",
        description: "הלוגו נשמר במערכת"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בהעלאת הלוגו",
        description: "לא ניתן היה להעלות את הלוגו"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
          <span className="mt-2">טוען נתונים...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">מידע כללי</h1>
        <p className="text-gray-500">עריכת מידע כללי והגדרות של בית הכנסת</p>
      </div>
      
      <Card className="border-0 shadow-md bg-white">
        <CardHeader>
          <CardTitle>פרטי בית הכנסת</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="synagogueName">שם בית הכנסת</Label>
            <Input
              id="synagogueName"
              value={settings.synagogueName}
              onChange={(e) => setSettings(prev => ({ ...prev, synagogueName: e.target.value }))}
              placeholder="הזן את שם בית הכנסת"
            />
          </div>
          
          <div className="space-y-2">
            <Label>לוגו בית הכנסת</Label>
            <div className="flex flex-col space-y-4">
              {settings.logo && (
                <div className="p-4 border rounded-md bg-gray-50 max-w-xs">
                  <img 
                    src={settings.logo} 
                    alt="לוגו בית הכנסת" 
                    className="max-h-32 mx-auto"
                  />
                </div>
              )}
              
              <div>
                <input
                  type="file"
                  id="logo-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('logo-upload').click()}
                  disabled={isSaving}
                >
                  <Upload className="w-4 h-4 ml-2" />
                  {settings.logo ? "החלף לוגו" : "העלה לוגו"} 
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nusach">נוסח</Label>
            <Select
              value={settings.nusach}
              onValueChange={(value) => setSettings(prev => ({ ...prev, nusach: value }))}
            >
              <SelectTrigger id="nusach">
                <SelectValue placeholder="בחר נוסח" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ספרד">ספרד</SelectItem>
                <SelectItem value="אשכנז">אשכנז</SelectItem>
                <SelectItem value="ספרדי ירושלמי">ספרדי ירושלמי</SelectItem>
                <SelectItem value="עדות המזרח">עדות המזרח</SelectItem>
                <SelectItem value="תימני">תימני</SelectItem>
                <SelectItem value="חב״ד">חב״ד</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="marqueeText">טקסט רץ בתחתית הלוח</Label>
            <Input
              id="marqueeText"
              value={settings.bottomMarqueeText}
              onChange={(e) => setSettings(prev => ({ ...prev, bottomMarqueeText: e.target.value }))}
              placeholder="טקסט שיופיע בתחתית הלוח כטקסט רץ"
            />
            <p className="text-sm text-gray-500">טקסט זה יופיע בתחתית הלוח כטקסט רץ משמאל לימין</p>
          </div>
          
          <div className="pt-4">
            <Button 
              className="bg-[#F59E0B] hover:bg-[#D97706]"
              onClick={saveSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  שומר...
                </>
              ) : "שמור הגדרות"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}