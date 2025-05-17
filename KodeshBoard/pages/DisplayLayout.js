
import React, { useState, useEffect } from "react";
import { DisplayConfig, Settings } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Layout, PanelRight, Grid, File, Clock, BookOpen, Type } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Toaster } from "@/components/ui/toaster";
import { createPageUrl } from "@/utils";

// Zone Content Editor component
function ZoneContentEditor({ isOpen, onClose, onSave, zoneId, initialData }) {
  const [activeTab, setActiveTab] = useState(initialData?.display_type || "custom_text");
  const [backgroundColor, setBackgroundColor] = useState(initialData?.zone_background_color || "#FFFFFF");
  const [customTextTitle, setCustomTextTitle] = useState(initialData?.config?.title || "");
  const [customTextContent, setCustomTextContent] = useState(initialData?.config?.content || "");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (initialData) {
      setActiveTab(initialData.display_type || "custom_text");
      setBackgroundColor(initialData.zone_background_color || "#FFFFFF");
      
      // Set custom text fields if applicable
      if (initialData.display_type === "custom_text" && initialData.config) {
        setCustomTextTitle(initialData.config.title || "");
        setCustomTextContent(initialData.config.content || "");
      }
    } else {
      // Reset form
      setActiveTab("custom_text");
      setBackgroundColor("#FFFFFF");
      setCustomTextTitle("");
      setCustomTextContent("");
    }
  }, [initialData, isOpen]);
  
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      let configData = {};
      
      // Prepare config based on display type
      if (activeTab === "custom_text") {
        configData = {
          title: customTextTitle,
          content: customTextContent
        };
      } else if (activeTab === "daily_times") {
        configData = {
          // No additional config needed for now
        };
      } else if (activeTab === "daily_study") {
        configData = {
          // No additional config needed for now
        };
      }
      
      const zoneData = {
        template_id: initialData?.template_id || "template_1",
        zone_id: zoneId,
        display_type: activeTab,
        config: configData,
        zone_background_color: backgroundColor
      };
      
      // If editing existing zone
      if (initialData?.id) {
        await DisplayConfig.update(initialData.id, zoneData);
      } else {
        // Creating new zone config
        await DisplayConfig.create(zoneData);
      }
      
      toast({
        title: "נשמר בהצלחה",
        description: "הגדרות האזור נשמרו בהצלחה"
      });
      
      onSave(zoneData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בשמירה",
        description: "לא ניתן היה לשמור את הגדרות האזור"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>הגדרת תוכן לאזור {zoneId}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily_times" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                זמני היום
              </TabsTrigger>
              <TabsTrigger value="daily_study" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                לימוד יומי
              </TabsTrigger>
              <TabsTrigger value="custom_text" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                טקסט חופשי
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily_times" className="mt-4">
              <div className="p-4 rounded-md bg-gray-100">
                <h3 className="flex items-center gap-2 font-medium mb-2">
                  <Clock className="h-4 w-4 text-[#F59E0B]" />
                  זמני היום
                </h3>
                <p className="text-sm text-gray-600">
                  האזור יציג את זמני היום הנבחרים בהגדרות המידע הקבוע.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="daily_study" className="mt-4">
              <div className="p-4 rounded-md bg-gray-100">
                <h3 className="flex items-center gap-2 font-medium mb-2">
                  <BookOpen className="h-4 w-4 text-[#F59E0B]" />
                  לימוד יומי
                </h3>
                <p className="text-sm text-gray-600">
                  האזור יציג את הלימודים היומיים הנבחרים בהגדרות המידע הקבוע.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="custom_text" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="text-title">כותרת</Label>
                  <Input
                    id="text-title"
                    placeholder="הכנס כותרת"
                    value={customTextTitle}
                    onChange={(e) => setCustomTextTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="text-content">תוכן</Label>
                  <Textarea
                    id="text-content"
                    placeholder="הכנס תוכן טקסט חופשי"
                    value={customTextContent}
                    onChange={(e) => setCustomTextContent(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label htmlFor="background-color">צבע רקע לאזור</Label>
            <div className="flex gap-3">
              <Input
                id="background-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-16 h-10 p-1"
              />
              <Input
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button 
            className="bg-[#F59E0B] hover:bg-[#D97706]" 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : "שמור"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function DisplayLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("template_1");
  const [zoneConfigs, setZoneConfigs] = useState({});
  const [selectedZone, setSelectedZone] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Template definitions
  const templates = {
    template_1: {
      name: "תבנית עם אזור מרכזי גדול ואזורים צדדיים",
      zones: [
        { id: "main", name: "אזור מרכזי" },
        { id: "side_1", name: "אזור צדדי 1" },
        { id: "side_2", name: "אזור צדדי 2" },
        { id: "side_3", name: "אזור צדדי 3" },
        { id: "side_4", name: "אזור צדדי 4" },
        { id: "side_5", name: "אזור צדדי 5" },
        { id: "side_6", name: "אזור צדדי 6" }
      ]
    },
    template_2: {
      name: "תבנית עם 9 אזורים שווים",
      zones: [
        { id: "zone_1", name: "אזור 1" },
        { id: "zone_2", name: "אזור 2" },
        { id: "zone_3", name: "אזור 3" },
        { id: "zone_4", name: "אזור 4" },
        { id: "zone_5", name: "אזור 5" },
        { id: "zone_6", name: "אזור 6" },
        { id: "zone_7", name: "אזור 7" },
        { id: "zone_8", name: "אזור 8" },
        { id: "zone_9", name: "אזור 9" }
      ]
    }
  };
  
  useEffect(() => {
    loadDisplayConfig();
  }, []);
  
  useEffect(() => {
    // When template changes, reload the configs
    loadDisplayConfig();
  }, [selectedTemplate]);
  
  const loadDisplayConfig = async () => {
    try {
      setIsLoading(true);
      
      // First load template settings
      const templateSettings = await Settings.filter({ key: "template_id" });
      if (templateSettings.length > 0) {
        setSelectedTemplate(templateSettings[0].value.id || "template_1");
      }
      
      // Load zone configurations
      const configs = await DisplayConfig.list();
      
      // Group by zone ID
      const zoneConfigMap = {};
      configs.forEach(config => {
        // Only include configs for the current template
        if (config.template_id === selectedTemplate) {
          zoneConfigMap[config.zone_id] = config;
        }
      });
      
      setZoneConfigs(zoneConfigMap);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת נתונים",
        description: "לא ניתן היה לטעון את הגדרות התצוגה"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveTemplateSelection = async () => {
    try {
      setIsSaving(true);
      
      // Save template selection
      const templateSettings = await Settings.filter({ key: "template_id" });
      if (templateSettings.length > 0) {
        await Settings.update(templateSettings[0].id, {
          key: "template_id",
          value: { id: selectedTemplate }
        });
      } else {
        await Settings.create({
          key: "template_id",
          value: { id: selectedTemplate }
        });
      }
      
      toast({
        title: "נשמר בהצלחה",
        description: "בחירת התבנית נשמרה בהצלחה"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בשמירה",
        description: "לא ניתן היה לשמור את בחירת התבנית"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
  };
  
  const handleZoneClick = (zoneId) => {
    // Find config for this zone if it exists
    const zoneConfig = zoneConfigs[zoneId];
    setSelectedZone({
      id: zoneId,
      config: zoneConfig
    });
    setIsDialogOpen(true);
  };
  
  const handleZoneConfigSave = (configData) => {
    setIsDialogOpen(false);
    
    // Update local state
    setZoneConfigs(prev => ({
      ...prev,
      [configData.zone_id]: configData
    }));
  };
  
  const getZoneTypeIcon = (zoneId) => {
    const zoneConfig = zoneConfigs[zoneId];
    if (!zoneConfig) return <File className="w-5 h-5 text-gray-400" />;
    
    switch (zoneConfig.display_type) {
      case "daily_times":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "daily_study":
        return <BookOpen className="w-5 h-5 text-green-500" />;
      case "custom_text":
        return <Type className="w-5 h-5 text-purple-500" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getZoneTypeName = (zoneId) => {
    const zoneConfig = zoneConfigs[zoneId];
    if (!zoneConfig) return "לא הוגדר";
    
    switch (zoneConfig.display_type) {
      case "daily_times":
        return "זמני היום";
      case "daily_study":
        return "לימוד יומי";
      case "custom_text":
        return `טקסט: ${zoneConfig.config?.title || ""}`;
      default:
        return "לא הוגדר";
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
    <div className="max-w-6xl mx-auto">
      <Toaster />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">עריכת פריסת תצוגה</h1>
        <p className="text-gray-500">בחר תבנית והגדר את תוכן האזורים בלוח</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center">
                <Layout className="ml-2 h-5 w-5 text-[#F59E0B]" />
                בחירת תבנית
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <RadioGroup 
                    value={selectedTemplate} 
                    onValueChange={handleTemplateChange}
                    className="flex flex-col space-y-4"
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="template_1" id="template_1" />
                        <Label htmlFor="template_1">תבנית עם אזור מרכזי</Label>
                      </div>
                      <div className="pr-7">
                        <div className="border p-2 bg-gray-50 rounded-md">
                          <div className="w-full aspect-video bg-white border flex flex-col">
                            <div className="w-full h-6 bg-gray-200 flex items-center justify-between px-2">
                              <div className="w-8 h-4 bg-gray-300 rounded-sm"></div>
                              <div className="w-12 h-4 bg-gray-300 rounded-sm"></div>
                              <div className="w-8 h-4 bg-gray-300 rounded-sm"></div>
                            </div>
                            <div className="flex flex-1 p-1 gap-1">
                              <div className="w-1/3 flex flex-col gap-1">
                                <div className="flex-1 bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                                  1
                                </div>
                                <div className="flex-1 bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                                  2
                                </div>
                                <div className="flex-1 bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                                  3
                                </div>
                              </div>
                              <div className="w-2/3 bg-gray-100 border flex items-center justify-center">
                                <span className="text-sm text-gray-400">אזור מרכזי</span>
                              </div>
                            </div>
                            <div className="flex w-full h-12 p-1 gap-1">
                              <div className="flex-1 bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                                4
                              </div>
                              <div className="flex-1 bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                                5
                              </div>
                              <div className="flex-1 bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                                6
                              </div>
                            </div>
                            <div className="w-full h-6 bg-gray-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value="template_2" id="template_2" />
                        <Label htmlFor="template_2">תבנית עם 9 אזורים שווים</Label>
                      </div>
                      <div className="pr-7">
                        <div className="border p-2 bg-gray-50 rounded-md">
                          <div className="w-full aspect-video bg-white border flex flex-col">
                            <div className="w-full h-6 bg-gray-200 flex items-center justify-between px-2">
                              <div className="w-8 h-4 bg-gray-300 rounded-sm"></div>
                              <div className="w-12 h-4 bg-gray-300 rounded-sm"></div>
                              <div className="w-8 h-4 bg-gray-300 rounded-sm"></div>
                            </div>
                            <div className="flex flex-1 p-1 gap-1">
                              <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                  <div 
                                    key={num}
                                    className="bg-gray-100 border flex items-center justify-center text-xs text-gray-400"
                                  >
                                    {num}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="w-full h-6 bg-gray-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <Button 
                    className="w-full mt-4 bg-[#F59E0B] hover:bg-[#D97706]"
                    onClick={saveTemplateSelection}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        שומר...
                      </>
                    ) : (
                      <>
                        <Save className="ml-2 h-4 w-4" />
                        שמור בחירת תבנית
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center">
                {selectedTemplate === "template_1" ? (
                  <PanelRight className="ml-2 h-5 w-5 text-[#F59E0B]" />
                ) : (
                  <Grid className="ml-2 h-5 w-5 text-[#F59E0B]" />
                )}
                הגדרת אזורי תצוגה
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <p className="text-gray-600">
                  לחץ על כל אזור כדי להגדיר את התוכן שיוצג בו
                </p>
              </div>
              
              {selectedTemplate === "template_1" ? (
                <div className="aspect-video border border-gray-300 bg-white rounded-md overflow-hidden shadow-sm flex flex-col">
                  {/* Header */}
                  <div className="h-12 bg-[#1F2937] flex items-center justify-between px-4 text-white">
                    <div className="w-10 h-6 bg-white/20 rounded"></div>
                    <div className="w-16 h-6 bg-white/20 rounded"></div>
                    <div className="w-10 h-6 bg-white/20 rounded"></div>
                  </div>
                  
                  {/* Main content */}
                  <div className="flex flex-1 p-2 gap-2">
                    {/* Left column with 3 zones */}
                    <div className="w-1/4 flex flex-col gap-2">
                      {["side_1", "side_2", "side_3"].map((zoneId, idx) => (
                        <button
                          key={zoneId}
                          className="flex-1 rounded border border-gray-300 hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-colors flex flex-col items-center justify-center p-2 overflow-hidden relative"
                          style={{ 
                            backgroundColor: zoneConfigs[zoneId]?.zone_background_color || "#FFFFFF" 
                          }}
                          onClick={() => handleZoneClick(zoneId)}
                        >
                          <div className="absolute top-1 left-1">
                            {getZoneTypeIcon(zoneId)}
                          </div>
                          <div className="text-xs font-medium mt-4 text-gray-800">
                            {getZoneTypeName(zoneId)}
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* Main zone */}
                    <button
                      className="w-2/4 rounded border border-gray-300 hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-colors flex flex-col items-center justify-center p-4 relative"
                      style={{ 
                        backgroundColor: zoneConfigs["main"]?.zone_background_color || "#FFFFFF" 
                      }}
                      onClick={() => handleZoneClick("main")}
                    >
                      <div className="absolute top-2 left-2">
                        {getZoneTypeIcon("main")}
                      </div>
                      <div className="text-sm font-medium mt-4 text-gray-800">
                        {getZoneTypeName("main")}
                      </div>
                    </button>
                    
                    {/* Right column with 3 zones */}
                    <div className="w-1/4 flex flex-col gap-2">
                      {["side_4", "side_5", "side_6"].map((zoneId, idx) => (
                        <button
                          key={zoneId}
                          className="flex-1 rounded border border-gray-300 hover:border-[#F59E0B] hover:bg-[#F59E0B]/5 transition-colors flex flex-col items-center justify-center p-2 overflow-hidden relative"
                          style={{ 
                            backgroundColor: zoneConfigs[zoneId]?.zone_background_color || "#FFFFFF" 
                          }}
                          onClick={() => handleZoneClick(zoneId)}
                        >
                          <div className="absolute top-1 left-1">
                            {getZoneTypeIcon(zoneId)}
                          </div>
                          <div className="text-xs font-medium mt-4 text-gray-800">
                            {getZoneTypeName(zoneId)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="h-8 bg-[#1F2937] flex items-center px-4">
                    <div className="w-full h-4 bg-white/20 rounded"></div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video border border-gray-300 bg-white rounded-md overflow-hidden shadow-sm flex flex-col">
 