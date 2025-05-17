import React, { useState, useEffect, useRef } from "react";
import { Settings, DisplayConfig, PrayerTimes, DailyTimesData } from "@/entities/all";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function Display() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    synagogueName: "בית הכנסת",
    logo: "",
    bottomMarqueeText: "ברוכים הבאים לבית הכנסת",
    templateId: "template_1"
  });
  const [displayConfigs, setDisplayConfigs] = useState({});
  const [dailyTimesData, setDailyTimesData] = useState(null);
  const [dailyStudyConfig, setDailyStudyConfig] = useState({});
  const [dailyTimesConfig, setDailyTimesConfig] = useState({});
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hebrewDate, setHebrewDate] = useState("");
  const [parsha, setParsha] = useState("");
  const marqueeRef = useRef(null);
  
  useEffect(() => {
    loadAllData();
    
    // Update time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      
      // Load general settings
      const allSettings = await Settings.list();
      
      const synagogueNameSetting = allSettings.find(s => s.key === "synagogue_name");
      const logoSetting = allSettings.find(s => s.key === "logo");
      const marqueeSetting = allSettings.find(s => s.key === "bottom_marquee_text");
      const templateSetting = allSettings.find(s => s.key === "template_id");
      const dailyTimesSetting = allSettings.find(s => s.key === "daily_times_config");
      const dailyStudySetting = allSettings.find(s => s.key === "daily_study_config");
      
      setSettings({
        synagogueName: synagogueNameSetting?.value?.text || "בית הכנסת",
        logo: logoSetting?.value?.url || "",
        bottomMarqueeText: marqueeSetting?.value?.text || "ברוכים הבאים לבית הכנסת",
        templateId: templateSetting?.value?.id || "template_1"
      });
      
      if (dailyTimesSetting) {
        setDailyTimesConfig(dailyTimesSetting.value || {});
      }
      
      if (dailyStudySetting) {
        setDailyStudyConfig(dailyStudySetting.value || {});
      }
      
      // Load display configurations
      const configs = await DisplayConfig.list();
      
      // Group configs by zone ID
      const configsByZone = {};
      configs.forEach(config => {
        if (config.template_id === (templateSetting?.value?.id || "template_1")) {
          configsByZone[config.zone_id] = config;
        }
      });
      
      setDisplayConfigs(configsByZone);
      
      // Load prayer times
      const prayers = await PrayerTimes.list();
      setPrayerTimes(prayers);
      
      // Load daily times data (fake data for this demo)
      // In a real implementation, this would be populated by a backend function
      // that calculates times based on the synagogue's location
      const today = new Date();
      setDailyTimesData({
        date: format(today, "yyyy-MM-dd"),
        weekday: today.getDay(),
        hebrew_day: "ט״ז",
        hebrew_day_number: "16",
        hebrew_month: "חשון",
        is_special_day: false,
        special_day_type: null,
        times: {
          alos_hashachar: "05:12",
          mi_sheyakir: "05:45",
          tzitzit_tefillin: "06:00",
          sunrise_plain: "06:40",
          sunrise_visible: "06:45",
          shema_mga: "08:30",
          shema_gra: "09:15",
          tefila_mga: "09:45",
          tefila_gra: "10:20",
          chatzot_day: "12:00",
          mincha_gedola: "12:30",
          mincha_ketana: "15:30",
          plag_hamincha: "16:15",
          sunset_plain: "17:00",
          sunset_visible: "17:05",
          tzeit: "17:42",
          tzeit_r_tam: "18:12",
          chatzot_night: "00:00",
          candle_lighting: "16:45",
          shabbat_exit: "17:50"
        }
      });
      
      // Set Hebrew date and parsha (fake data for demo)
      setHebrewDate("ט״ז בחשון תשפ״ה");
      setParsha("לך לך");
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderDailyTimes = () => {
    if (!dailyTimesData || !dailyTimesConfig) return <p>טוען זמני היום...</p>;
    
    // Filter times based on selected config
    const timesToShow = Object.entries(dailyTimesConfig)
      .filter(([key, selected]) => selected)
      .map(([key]) => key);
    
    const timeLabels = {
      alos_hashachar: "עלות השחר",
      mi_sheyakir: "משיכיר",
      tzitzit_tefillin: "זמן טלית ותפילין",
      sunrise_plain: "זריחה מישורית",
      sunrise_visible: "הנץ החמה",
      shema_mga: "סוף זמן ק״ש מג״א",
      shema_gra: "סוף זמן ק״ש גר״א",
      tefila_mga: "סוף זמן תפילה מג״א",
      tefila_gra: "סוף זמן תפילה גר״א",
      chatzot_day: "חצות היום",
      mincha_gedola: "מנחה גדולה",
      mincha_ketana: "מנחה קטנה",
      plag_hamincha: "פלג המנחה",
      sunset_plain: "שקיעה מישורית",
      sunset_visible: "שקיעה",
      tzeit: "צאת הכוכבים",
      tzeit_r_tam: "ר״ת",
      chatzot_night: "חצות הלילה",
      candle_lighting: "הדלקת נרות",
      yomtov_entry: "כניסת החג",
      shabbat_exit: "צאת השבת",
      yomtov_exit: "צאת החג"
    };
    
    return (
      <div className="space-y-2">
        {timesToShow.map(timeKey => (
          <div key={timeKey} className="flex justify-between items-center">
            <div className="font-medium">{timeLabels[timeKey]}</div>
            <div className="text-lg">{dailyTimesData.times[timeKey] || "—"}</div>
          </div>
        ))}
      </div>
    );
  };
  
  const renderDailyStudy = () => {
    if (!dailyStudyConfig) return <p>טוען לימודים יומיים...</p>;
    
    // Filter studies based on selected config
    const studiesToShow = Object.entries(dailyStudyConfig)
      .filter(([key, selected]) => selected)
      .map(([key]) => key);
    
    // Sample data for demo
    const studyData = {
      daf_yomi: "בבא מציעא דף ק״ב",
      daf_yomi_yerushalmi: "פאה דף י״ב",
      halacha_yomit: "אורח חיים סימן קל״ט",
      amud_yomi_dirshu: "ברכות דף ז:",
      rambam_yomi: "הלכות שבת פרק ט׳",
      mishna_yomit: "כלים פרק ג׳ משניות ד׳-ה׳",
      halacha_daily: "משנה ברורה סימן נ״ה"
    };
    
    const studyLabels = {
      daf_yomi: "דף יומי",
      daf_yomi_yerushalmi: "דף יומי ירושלמי",
      halacha_yomit: "הלכה יומית",
      amud_yomi_dirshu: "עמוד יומי דירשו",
      rambam_yomi: "רמב״ם יומי",
      mishna_yomit: "משנה יומית",
      halacha_daily: "הלכה יומית"
    };
    
    return (
      <div className="space-y-2">
        {studiesToShow.map(studyKey => (
          <div key={studyKey} className="flex justify-between items-center">
            <div className="font-medium">{studyLabels[studyKey]}</div>
            <div className="text-lg">{studyData[studyKey] || "—"}</div>
          </div>
        ))}
      </div>
    );
  };
  
  // Helper to render relevant prayers for the current day
  const renderPrayersForToday = () => {
    // In a real implementation, we would filter prayers based on the current day
    // For demo, just show all prayers
    return (
      <div className="space-y-2">
        <h3 className="font-bold text-lg mb-3">תפילות היום</h3>
        {prayerTimes
          .filter(prayer => prayer.type === "prayer")
          .map(prayer => (
            <div key={prayer.id} className="flex justify-between items-center border-b pb-1">
              <div className="font-medium">{prayer.name}</div>
              <div className="text-lg">
                {prayer.time_type === 'fixed' ? 
                  prayer.fixed_time : 
                  `${formatRelativeTime(prayer)}`}
              </div>
            </div>
          ))}
        
        <h3 className="font-bold text-lg mb-3 mt-6">שיעורים היום</h3>
        {prayerTimes
          .filter(prayer => prayer.type === "lesson")
          .map(prayer => (
            <div key={prayer.id} className="flex justify-between items-center border-b pb-1">
              <div className="font-medium">{prayer.name}</div>
              <div className="text-lg">{prayer.fixed_time}</div>
            </div>
          ))}
      </div>
    );
  };
  
  const formatRelativeTime = (prayer) => {
    // Simple formatting for demo purposes
    if (!prayer.anchor_time_id) return "—";
    
    const anchorNames = {
      'alos_hashachar': 'עלות השחר',
      'sunrise_visible': 'הנץ החמה',
      'shema_gra': 'ק״ש גר״א',
      'chatzot_day': 'חצות היום',
      'mincha_gedola': 'מנחה גדולה',
      'mincha_ketana': 'מנחה קטנה',
      'plag_hamincha': 'פלג המנחה',
      'sunset_visible': 'שקיעה',
      'tzeit': 'צאת הכוכבים',
      'chatzot_night': 'חצות הלילה'
    };
    
    const anchorName = anchorNames[prayer.anchor_time_id] || prayer.anchor_time_id;
    const offset = prayer.offset_minutes || 0;
    
    if (offset === 0) {
      return anchorName;
    } else if (offset > 0) {
      return `${anchorName} + ${offset}`;
    } else {
      return `${anchorName} - ${Math.abs(offset)}`;
    }
  };
  
  const renderZoneContent = (zoneId) => {
    const config = displayConfigs[zoneId];
    if (!config) return <div className="flex items-center justify-center h-full">לחץ כאן להגדרת האזור</div>;
    
    const backgroundColor = config.zone_background_color || "#FFFFFF";
    
    return (
      <div className="h-full overflow-auto p-3" style={{ backgroundColor }}>
        {config.display_type === "daily_times" && (
          <div>
            <h3 className="text-lg font-bold mb-3 border-b pb-1">זמני היום</h3>
            {renderDailyTimes()}
          </div>
        )}
        
        {config.display_type === "daily_study" && (
          <div>
            <h3 className="text-lg font-bold mb-3 border-b pb-1">לימוד יומי</h3>
            {renderDailyStudy()}
          </div>
        )}
        
        {config.display_type === "custom_text" && (
          <div>
            <h3 className="text-lg font-bold mb-3 border-b pb-1">
              {config.config?.title || "טקסט חופשי"}
            </h3>
            <div className="whitespace-pre-line">
              {config.config?.content || ""}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1F2937] text-white">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#F59E0B]" />
          <span className="mt-4 text-xl">טוען לוח תצוגה...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#1F2937] text-white overflow-hidden">
      {/* Header */}
      <header className="border-b border-white/20 p-4 flex items-center justify-between">
        <div className="flex items-center">
          {settings.logo ? (
            <img src={settings.logo} alt="לוגו" className="h-10 max-w-[100px] object-contain" />
          ) : (
            <div className="h-10 w-24 bg-white/10 rounded"></div>
          )}
          <div className="ml-4 text-lg font-bold">{settings.synagogueName}</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold">
            {format(currentTime, "HH:mm:ss")}
          </div>
        </div>
        
        <div className="text-left">
          <div className="text-lg font-medium">
            יום {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][currentTime.getDay()]} לפרשת {parsha}
          </div>
          <div>{hebrewDate}</div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4">
        {settings.templateId === "template_1" ? (
          <div className="grid grid-cols-12 gap-4 h-full">
            {/* Left sidebar */}
            <div className="col-span-3 grid grid-rows-3 gap-4 h-full">
              <div className="row-span-1 bg-white/5 rounded-lg overflow-hidden shadow-lg">
                {renderZoneContent("side_1")}
              </div>
              <div className="row-span-1 bg-white/5 rounded-lg overflow-hidden shadow-lg">
                {renderZoneContent("side_2")}
              </div>
              <div className="row-span-1 bg-white/5 rounded-lg overflow-hidden shadow-lg">
                {renderZoneContent("side_3")}
              </div>
            </div>
            
            {/* Main center */}
            <div className="col-span-6 bg-white/5 rounded-lg overflow-hidden shadow-lg">
              {renderZoneContent("main")}
            </div>
            
            {/* Right sidebar */}
            <div className="col-span-3 grid grid-rows-3 gap-4 h-full">
              <div className="row-span-1 bg-white/5 rounded-lg overflow-hidden shadow-lg">
                {renderZoneContent("side_4")}
              </div>
              <div className="row-span-1 bg-white/5 rounded-lg overflow-hidden shadow-lg">
                {renderZoneContent("side_5")}
              </div>
              <div className="row-span-1 bg-white/5 rounded-lg overflow-hidden shadow-lg">
                {renderZoneContent("side_6")}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 grid-rows-3 gap-4 h-full">
            {["zone_1", "zone_2", "zone_3", "zone_4", "zone_5", "zone_6", "zone_7", "zone_8", "zone_9"].map((zoneId) => (
              <div key={zoneId} className="bg-white/5 rounded-lg overflow-hidden shadow-lg">
                {renderZoneContent(zoneId)}
              </div>
            ))}
          </div>
        )}
      </main>
      
      {/* Footer with marquee */}
      <footer className="p-3 border-t border-white/20 bg-[#1F2937]">
        <div className="overflow-hidden whitespace-nowrap">
          <div 
            ref={marqueeRef}
            className="animate-marquee inline-block"
          >
            {settings.bottomMarqueeText}
          </div>
        </div>
      </footer>
      
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
}