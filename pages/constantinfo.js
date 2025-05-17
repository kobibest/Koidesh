import React, { useState, useEffect } from "react";
import { Settings } from "@/entities/Settings";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, Clock, BookOpen, Save } from "lucide-react";

export default function ConstantInfo() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // State for selected daily times
  const [selectedDailyTimes, setSelectedDailyTimes] = useState({
    alos_hashachar: false,
    mi_sheyakir: false,
    tzitzit_tefillin: false,
    sunrise_plain: false,
    sunrise_visible: true,
    shema_mga: false,
    shema_gra: true,
    tefila_mga: false,
    tefila_gra: false,
    chatzot_day: true,
    mincha_gedola: true,
    mincha_ketana: true,
    plag_hamincha: true,
    sunset_plain: false,
    sunset_visible: true,
    tzeit: true,
    tzeit_r_tam: false,
    chatzot_night: false,
    candle_lighting: true,
    yomtov_entry: true,
    shabbat_exit: true,
    yomtov_exit: true
  });
  
  // State for selected daily study
  const [selectedDailyStudy, setSelectedDailyStudy] = useState({
    daf_yomi: true,
    daf_yomi_yerushalmi: false,
    halacha_yomit: false,
    amud_yomi_dirshu: false,
    rambam_yomi: false,
    mishna_yomit: false,
    halacha_daily: false
  });
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      // Load daily times settings
      const dailyTimesSettings = await Settings.filter({ key: "daily_times_config" });
      if (dailyTimesSettings.length > 0) {
        setSelectedDailyTimes({
          ...selectedDailyTimes,
          ...dailyTimesSettings[0].value
        });
      }
      
      // Load daily study settings
      const dailyStudySettings = await Settings.filter({ key: "daily_study_config" });
      if (dailyStudySettings.length > 0) {
        setSelectedDailyStudy({
          ...selectedDailyStudy,
          ...dailyStudySettings[0].value
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת נתונים",
        description: "לא ניתן היה לטעון את הגדרות המידע הקבוע"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Save daily times settings
      await saveSetting("daily_times_config", selectedDailyTimes);
      
      // Save daily study settings
      await saveSetting("daily_study_config", selectedDailyStudy);
      
      toast({
        title: "נשמר בהצלחה",
        description: "הגדרות המידע הקבוע נשמרו בהצלחה"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בשמירה",
        description: "לא ניתן היה לשמור את הגדרות המידע הקבוע"
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
  
  const handleDailyTimeToggle = (key) => {
    setSelectedDailyTimes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleDailyStudyToggle = (key) => {
    setSelectedDailyStudy(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
        <h1 className="text-2xl font-bold">עריכת מידע קבוע</h1>
        <p className="text-gray-500">בחר אילו זמני יום ולימודים יומיים יוצגו בלוח</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md bg-white">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center">
              <Clock className="ml-2 h-5 w-5 text-[#F59E0B]" />
              זמני יום נתמכים
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="alos_hashachar" 
                  checked={selectedDailyTimes.alos_hashachar} 
                  onCheckedChange={() => handleDailyTimeToggle('alos_hashachar')}
                />
                <label
                  htmlFor="alos_hashachar"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  עלות השחר
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="mi_sheyakir" 
                  checked={selectedDailyTimes.mi_sheyakir} 
                  onCheckedChange={() => handleDailyTimeToggle('mi_sheyakir')}
                />
                <label
                  htmlFor="mi_sheyakir"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  משיכיר
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="tzitzit_tefillin" 
                  checked={selectedDailyTimes.tzitzit_tefillin} 
                  onCheckedChange={() => handleDailyTimeToggle('tzitzit_tefillin')}
                />
                <label
                  htmlFor="tzitzit_tefillin"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  זמן טלית ותפילין
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="sunrise_plain" 
                  checked={selectedDailyTimes.sunrise_plain} 
                  onCheckedChange={() => handleDailyTimeToggle('sunrise_plain')}
                />
                <label
                  htmlFor="sunrise_plain"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  זריחה מישורית
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="sunrise_visible" 
                  checked={selectedDailyTimes.sunrise_visible} 
                  onCheckedChange={() => handleDailyTimeToggle('sunrise_visible')}
                />
                <label
                  htmlFor="sunrise_visible"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  הנץ החמה
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="shema_mga" 
                  checked={selectedDailyTimes.shema_mga} 
                  onCheckedChange={() => handleDailyTimeToggle('shema_mga')}
                />
                <label
                  htmlFor="shema_mga"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  סוף זמן קריאת שמע מג"א
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="shema_gra" 
                  checked={selectedDailyTimes.shema_gra} 
                  onCheckedChange={() => handleDailyTimeToggle('shema_gra')}
                />
                <label
                  htmlFor="shema_gra"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  סוף זמן קריאת שמע גר"א
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="tefila_mga" 
                  checked={selectedDailyTimes.tefila_mga} 
                  onCheckedChange={() => handleDailyTimeToggle('tefila_mga')}
                />
                <label
                  htmlFor="tefila_mga"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  סוף זמן תפילה מג"א
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="tefila_gra" 
                  checked={selectedDailyTimes.tefila_gra} 
                  onCheckedChange={() => handleDailyTimeToggle('tefila_gra')}
                />
                <label
                  htmlFor="tefila_gra"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  סוף זמן תפילה גר"א
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="chatzot_day" 
                  checked={selectedDailyTimes.chatzot_day} 
                  onCheckedChange={() => handleDailyTimeToggle('chatzot_day')}
                />
                <label
                  htmlFor="chatzot_day"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  חצות היום
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="mincha_gedola" 
                  checked={selectedDailyTimes.mincha_gedola} 
                  onCheckedChange={() => handleDailyTimeToggle('mincha_gedola')}
                />
                <label
                  htmlFor="mincha_gedola"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  מנחה גדולה
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="mincha_ketana" 
                  checked={selectedDailyTimes.mincha_ketana} 
                  onCheckedChange={() => handleDailyTimeToggle('mincha_ketana')}
                />
                <label
                  htmlFor="mincha_ketana"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  מנחה קטנה
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="plag_hamincha" 
                  checked={selectedDailyTimes.plag_hamincha} 
                  onCheckedChange={() => handleDailyTimeToggle('plag_hamincha')}
                />
                <label
                  htmlFor="plag_hamincha"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  פלג המנחה
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="sunset_plain" 
                  checked={selectedDailyTimes.sunset_plain} 
                  onCheckedChange={() => handleDailyTimeToggle('sunset_plain')}
                />
                <label
                  htmlFor="sunset_plain"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  שקיעה מישורית
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="sunset_visible" 
                  checked={selectedDailyTimes.sunset_visible} 
                  onCheckedChange={() => handleDailyTimeToggle('sunset_visible')}
                />
                <label
                  htmlFor="sunset_visible"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  שקיעה נראית
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="tzeit" 
                  checked={selectedDailyTimes.tzeit} 
                  onCheckedChange={() => handleDailyTimeToggle('tzeit')}
                />
                <label
                  htmlFor="tzeit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  צאת הכוכבים
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="tzeit_r_tam" 
                  checked={selectedDailyTimes.tzeit_r_tam} 
                  onCheckedChange={() => handleDailyTimeToggle('tzeit_r_tam')}
                />
                <label
                  htmlFor="tzeit_r_tam"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  צאת הכוכבים לרבנו תם
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="chatzot_night" 
                  checked={selectedDailyTimes.chatzot_night} 
                  onCheckedChange={() => handleDailyTimeToggle('chatzot_night')}
                />
                <label
                  htmlFor="chatzot_night"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  חצות הלילה
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="candle_lighting" 
                  checked={selectedDailyTimes.candle_lighting} 
                  onCheckedChange={() => handleDailyTimeToggle('candle_lighting')}
                />
                <label
                  htmlFor="candle_lighting"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  הדלקת נרות
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="yomtov_entry" 
                  checked={selectedDailyTimes.yomtov_entry} 
                  onCheckedChange={() => handleDailyTimeToggle('yomtov_entry')}
                />
                <label
                  htmlFor="yomtov_entry"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  כניסת חג
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="shabbat_exit" 
                  checked={selectedDailyTimes.shabbat_exit} 
                  onCheckedChange={() => handleDailyTimeToggle('shabbat_exit')}
                />
                <label
                  htmlFor="shabbat_exit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  צאת שבת
                </label>
              </div>
              
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="yomtov_exit" 
                  checked={selectedDailyTimes.yomtov_exit} 
                  onCheckedChange={() => handleDailyTimeToggle('yomtov_exit')}
                />
                <label
                  htmlFor="yomtov_exit"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  צאת חג
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center">
                <BookOpen className="ml-2 h-5 w-5 text-[#F59E0B]" />
                לימוד יומי נתמך
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="daf_yomi" 
                    checked={selectedDailyStudy.daf_yomi} 
                    onCheckedChange={() => handleDailyStudyToggle('daf_yomi')}
                  />
                  <label
                    htmlFor="daf_yomi"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    דף יומי
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="daf_yomi_yerushalmi" 
                    checked={selectedDailyStudy.daf_yomi_yerushalmi} 
                    onCheckedChange={() => handleDailyStudyToggle('daf_yomi_yerushalmi')}
                  />
                  <label
                    htmlFor="daf_yomi_yerushalmi"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    דף יומי ירושלמי
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="halacha_yomit" 
                    checked={selectedDailyStudy.halacha_yomit} 
                    onCheckedChange={() => handleDailyStudyToggle('halacha_yomit')}
                  />
                  <label
                    htmlFor="halacha_yomit"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    דף יומי בהלכה
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="amud_yomi_dirshu" 
                    checked={selectedDailyStudy.amud_yomi_dirshu} 
                    onCheckedChange={() => handleDailyStudyToggle('amud_yomi_dirshu')}
                  />
                  <label
                    htmlFor="amud_yomi_dirshu"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    עמוד יומי דירשו
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="rambam_yomi" 
                    checked={selectedDailyStudy.rambam_yomi} 
                    onCheckedChange={() => handleDailyStudyToggle('rambam_yomi')}
                  />
                  <label
                    htmlFor="rambam_yomi"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    רמב"ם יומי
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="mishna_yomit" 
                    checked={selectedDailyStudy.mishna_yomit} 
                    onCheckedChange={() => handleDailyStudyToggle('mishna_yomit')}
                  />
                  <label
                    htmlFor="mishna_yomit"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    משנה יומית
                  </label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox 
                    id="halacha_daily" 
                    checked={selectedDailyStudy.halacha_daily} 
                    onCheckedChange={() => handleDailyStudyToggle('halacha_daily')}
                  />
                  <label
                    htmlFor="halacha_daily"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    הלכה יומית
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            className="w-full bg-[#F59E0B] hover:bg-[#D97706]"
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שומר הגדרות...
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                שמור הגדרות
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}