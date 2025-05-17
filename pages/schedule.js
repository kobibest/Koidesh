import React, { useState, useEffect } from "react";
import { PrayerTimes } from "@/entities/PrayerTimes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "@/components/ui/toaster";
import { Plus, Pencil, Trash2, Clock, Loader2 } from "lucide-react";

// Component for adding/editing prayer times
function EventDialog({ open, onClose, onSave, editingEvent = null }) {
  const isEditing = !!editingEvent;
  
  const [formData, setFormData] = useState({
    name: "",
    type: "prayer",
    prayer_type: "",
    time_type: "fixed",
    fixed_time: "08:00",
    anchor_time_id: "sunrise_visible",
    offset_minutes: 0,
    valid_on: [
      // Default to all weekdays
      { type: 'weekday', value: 0 },
      { type: 'weekday', value: 1 },
      { type: 'weekday', value: 2 },
      { type: 'weekday', value: 3 },
      { type: 'weekday', value: 4 },
      { type: 'weekday', value: 5 },
      { type: 'weekday', value: 6 }
    ]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Weekday selection state
  const [selectedDays, setSelectedDays] = useState({
    sunday: true,
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true
  });
  
  // Special days selection state
  const [selectedSpecialDays, setSelectedSpecialDays] = useState({
    rosh_chodesh: false,
    chanukah: false,
    purim: false,
    pesach: false,
    shavuot: false,
    sukkot: false,
    yom_kippur: false,
    rosh_hashanah: false,
    fast_days: false
  });
  
  useEffect(() => {
    if (editingEvent) {
      setFormData({
        name: editingEvent.name || "",
        type: editingEvent.type || "prayer",
        prayer_type: editingEvent.prayer_type || "",
        time_type: editingEvent.time_type || "fixed",
        fixed_time: editingEvent.fixed_time || "08:00",
        anchor_time_id: editingEvent.anchor_time_id || "sunrise_visible",
        offset_minutes: editingEvent.offset_minutes || 0,
        valid_on: editingEvent.valid_on || [
          { type: 'weekday', value: 0 },
          { type: 'weekday', value: 1 },
          { type: 'weekday', value: 2 },
          { type: 'weekday', value: 3 },
          { type: 'weekday', value: 4 },
          { type: 'weekday', value: 5 },
          { type: 'weekday', value: 6 }
        ]
      });
      
      // Set weekday selection
      const weekdayValues = {
        0: 'sunday',
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday',
        6: 'saturday'
      };
      
      const newSelectedDays = {
        sunday: false,
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false
      };
      
      const newSelectedSpecialDays = {
        rosh_chodesh: false,
        chanukah: false,
        purim: false,
        pesach: false,
        shavuot: false,
        sukkot: false,
        yom_kippur: false,
        rosh_hashanah: false,
        fast_days: false
      };
      
      // Set the selected days based on valid_on values
      if (editingEvent.valid_on) {
        editingEvent.valid_on.forEach(item => {
          if (item.type === 'weekday') {
            const day = weekdayValues[item.value];
            if (day) {
              newSelectedDays[day] = true;
            }
          } else if (item.type === 'special') {
            newSelectedSpecialDays[item.value] = true;
          }
        });
      }
      
      setSelectedDays(newSelectedDays);
      setSelectedSpecialDays(newSelectedSpecialDays);
    } else {
      // Reset form for new event
      setFormData({
        name: "",
        type: "prayer",
        prayer_type: "",
        time_type: "fixed",
        fixed_time: "08:00",
        anchor_time_id: "sunrise_visible",
        offset_minutes: 0,
        valid_on: [
          { type: 'weekday', value: 0 },
          { type: 'weekday', value: 1 },
          { type: 'weekday', value: 2 },
          { type: 'weekday', value: 3 },
          { type: 'weekday', value: 4 },
          { type: 'weekday', value: 5 },
          { type: 'weekday', value: 6 }
        ]
      });
      
      setSelectedDays({
        sunday: true,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true
      });
      
      setSelectedSpecialDays({
        rosh_chodesh: false,
        chanukah: false,
        purim: false,
        pesach: false,
        shavuot: false,
        sukkot: false,
        yom_kippur: false,
        rosh_hashanah: false,
        fast_days: false
      });
    }
  }, [editingEvent, open]);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleWeekdayChange = (day, checked) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: checked
    }));
  };
  
  const handleSpecialDayChange = (day, checked) => {
    setSelectedSpecialDays(prev => ({
      ...prev,
      [day]: checked
    }));
  };
  
  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Build valid_on array from selections
      const weekdayMapping = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6
      };
      
      const newValidOn = [];
      
      // Add weekdays
      Object.entries(selectedDays).forEach(([day, selected]) => {
        if (selected) {
          newValidOn.push({
            type: 'weekday',
            value: weekdayMapping[day]
          });
        }
      });
      
      // Add special days
      Object.entries(selectedSpecialDays).forEach(([day, selected]) => {
        if (selected) {
          newValidOn.push({
            type: 'special',
            value: day
          });
        }
      });
      
      // Create new prayer time data
      const eventData = {
        ...formData,
        valid_on: newValidOn
      };
      
      if (isEditing) {
        await PrayerTimes.update(editingEvent.id, eventData);
        toast({
          title: "נשמר בהצלחה",
          description: `${formData.type === 'prayer' ? 'התפילה' : 'השיעור'} עודכן בהצלחה`
        });
      } else {
        await PrayerTimes.create(eventData);
        toast({
          title: "נוסף בהצלחה",
          description: `${formData.type === 'prayer' ? 'התפילה' : 'השיעור'} נוסף בהצלחה`
        });
      }
      
      onSave();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בשמירה",
        description: `לא ניתן היה לשמור את ${formData.type === 'prayer' ? 'התפילה' : 'השיעור'}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 
              (formData.type === 'prayer' ? 'עריכת תפילה' : 'עריכת שיעור') : 
              'הוספת אירוע חדש'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Tabs defaultValue={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prayer">תפילה</TabsTrigger>
              <TabsTrigger value="lesson">שיעור</TabsTrigger>
            </TabsList>
            
            <TabsContent value="prayer" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="prayer-name">שם התפילה</Label>
                <Input
                  id="prayer-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="לדוגמה: שחרית, מנחה, ערבית"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prayer-type">סוג התפילה</Label>
                <Select
                  value={formData.prayer_type}
                  onValueChange={(value) => handleInputChange('prayer_type', value)}
                >
                  <SelectTrigger id="prayer-type">
                    <SelectValue placeholder="בחר סוג תפילה" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shacharit">שחרית</SelectItem>
                    <SelectItem value="mincha">מנחה</SelectItem>
                    <SelectItem value="arvit">ערבית</SelectItem>
                    <SelectItem value="musaf">מוסף</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>סוג זמן</Label>
                <RadioGroup 
                  value={formData.time_type} 
                  onValueChange={(value) => handleInputChange('time_type', value)}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="fixed" id="fixed-time" />
                    <Label htmlFor="fixed-time">זמן קבוע</Label>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <RadioGroupItem value="relative" id="relative-time" />
                    <Label htmlFor="relative-time">זמן יחסי</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.time_type === 'fixed' ? (
                <div className="space-y-2">
                  <Label htmlFor="fixed-time-input">שעה קבועה</Label>
                  <Input
                    id="fixed-time-input"
                    type="time"
                    value={formData.fixed_time}
                    onChange={(e) => handleInputChange('fixed_time', e.target.value)}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="anchor-time">זמן עוגן</Label>
                    <Select
                      value={formData.anchor_time_id}
                      onValueChange={(value) => handleInputChange('anchor_time_id', value)}
                    >
                      <SelectTrigger id="anchor-time">
                        <SelectValue placeholder="בחר זמן עוגן" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alos_hashachar">עלות השחר</SelectItem>
                        <SelectItem value="sunrise_visible">הנץ החמה</SelectItem>
                        <SelectItem value="shema_gra">סוף זמן ק״ש גר״א</SelectItem>
                        <SelectItem value="chatzot_day">חצות היום</SelectItem>
                        <SelectItem value="mincha_gedola">מנחה גדולה</SelectItem>
                        <SelectItem value="mincha_ketana">מנחה קטנה</SelectItem>
                        <SelectItem value="plag_hamincha">פלג המנחה</SelectItem>
                        <SelectItem value="sunset_visible">שקיעה</SelectItem>
                        <SelectItem value="tzeit">צאת הכוכבים</SelectItem>
                        <SelectItem value="chatzot_night">חצות הלילה</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="offset-minutes">הפרש בדקות</Label>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Input
                        id="offset-minutes"
                        type="number"
                        value={formData.offset_minutes}
                        onChange={(e) => handleInputChange('offset_minutes', parseInt(e.target.value) || 0)}
                      />
                      <span>דקות</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formData.offset_minutes >= 0 ? "אחרי" : "לפני"} זמן העוגן
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="lesson" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-name">שם השיעור</Label>
                <Input
                  id="lesson-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="לדוגמה: שיעור דף יומי, שיעור הלכה"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lesson-time">שעה</Label>
                <Input
                  id="lesson-time"
                  type="time"
                  value={formData.fixed_time}
                  onChange={(e) => handleInputChange('fixed_time', e.target.value)}
                />
                <input type="hidden" value="fixed" onChange={() => handleInputChange('time_type', 'fixed')} />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-4">
            <h3 className="font-medium">ימים תקפים</h3>
            
            <div className="space-y-2">
              <Label>ימי השבוע</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedDays.sunday} 
                    onCheckedChange={(checked) => handleWeekdayChange('sunday', checked)} 
                    id="sunday" 
                  />
                  <Label htmlFor="sunday">ראשון</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedDays.monday} 
                    onCheckedChange={(checked) => handleWeekdayChange('monday', checked)} 
                    id="monday" 
                  />
                  <Label htmlFor="monday">שני</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedDays.tuesday} 
                    onCheckedChange={(checked) => handleWeekdayChange('tuesday', checked)} 
                    id="tuesday" 
                  />
                  <Label htmlFor="tuesday">שלישי</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedDays.wednesday} 
                    onCheckedChange={(checked) => handleWeekdayChange('wednesday', checked)} 
                    id="wednesday" 
                  />
                  <Label htmlFor="wednesday">רביעי</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedDays.thursday} 
                    onCheckedChange={(checked) => handleWeekdayChange('thursday', checked)} 
                    id="thursday" 
                  />
                  <Label htmlFor="thursday">חמישי</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedDays.friday} 
                    onCheckedChange={(checked) => handleWeekdayChange('friday', checked)} 
                    id="friday" 
                  />
                  <Label htmlFor="friday">שישי</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedDays.saturday} 
                    onCheckedChange={(checked) => handleWeekdayChange('saturday', checked)} 
                    id="saturday" 
                  />
                  <Label htmlFor="saturday">שבת</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>ימים מיוחדים</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.rosh_chodesh} 
                    onCheckedChange={(checked) => handleSpecialDayChange('rosh_chodesh', checked)} 
                    id="rosh_chodesh" 
                  />
                  <Label htmlFor="rosh_chodesh">ראש חודש</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.chanukah} 
                    onCheckedChange={(checked) => handleSpecialDayChange('chanukah', checked)} 
                    id="chanukah" 
                  />
                  <Label htmlFor="chanukah">חנוכה</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.purim} 
                    onCheckedChange={(checked) => handleSpecialDayChange('purim', checked)} 
                    id="purim" 
                  />
                  <Label htmlFor="purim">פורים</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.pesach} 
                    onCheckedChange={(checked) => handleSpecialDayChange('pesach', checked)} 
                    id="pesach" 
                  />
                  <Label htmlFor="pesach">פסח</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.shavuot} 
                    onCheckedChange={(checked) => handleSpecialDayChange('shavuot', checked)} 
                    id="shavuot" 
                  />
                  <Label htmlFor="shavuot">שבועות</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.sukkot} 
                    onCheckedChange={(checked) => handleSpecialDayChange('sukkot', checked)} 
                    id="sukkot" 
                  />
                  <Label htmlFor="sukkot">סוכות</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.yom_kippur} 
                    onCheckedChange={(checked) => handleSpecialDayChange('yom_kippur', checked)} 
                    id="yom_kippur" 
                  />
                  <Label htmlFor="yom_kippur">יום כיפור</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.rosh_hashanah} 
                    onCheckedChange={(checked) => handleSpecialDayChange('rosh_hashanah', checked)} 
                    id="rosh_hashanah" 
                  />
                  <Label htmlFor="rosh_hashanah">ראש השנה</Label>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch 
                    checked={selectedSpecialDays.fast_days} 
                    onCheckedChange={(checked) => handleSpecialDayChange('fast_days', checked)} 
                    id="fast_days" 
                  />
                  <Label htmlFor="fast_days">ימי צום</Label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>ביטול</Button>
          <Button 
            className="bg-[#F59E0B] hover:bg-[#D97706]" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                שומר...
              </>
            ) : isEditing ? "עדכן" : "הוסף"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeTab, setActiveTab] = useState("prayers");
  const { toast } = useToast();
  
  useEffect(() => {
    loadEvents();
  }, []);
  
  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const allEvents = await PrayerTimes.list();
      setEvents(allEvents);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת נתונים",
        description: "לא ניתן היה לטעון את לוח הזמנים"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddNew = () => {
    setEditingEvent(null);
    setIsDialogOpen(true);
  };
  
  const handleEdit = (event) => {
    setEditingEvent(event);
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (event) => {
    if (confirm(`האם למחוק את ${event.type === 'prayer' ? 'התפילה' : 'השיעור'} "${event.name}"?`)) {
      try {
        await PrayerTimes.delete(event.id);
        toast({
          title: "נמחק בהצלחה",
          description: `${event.type === 'prayer' ? 'התפילה' : 'השיעור'} נמחק בהצלחה`
        });
        loadEvents();
      } catch (error) {
        toast({
          variant: "destructive",
          title: "שגיאה במחיקה",
          description: `לא ניתן היה למחוק את ${event.type === 'prayer' ? 'התפילה' : 'השיעור'}`
        });
      }
    }
  };
  
  const handleSave = () => {
    setIsDialogOpen(false);
    loadEvents();
  };
  
  const formatTime = (event) => {
    if (event.time_type === 'fixed') {
      return event.fixed_time;
    } else {
      // Format relative time
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
      
      const anchorName = anchorNames[event.anchor_time_id] || event.anchor_time_id;
      const offset = event.offset_minutes || 0;
      
      if (offset === 0) {
        return anchorName;
      } else if (offset > 0) {
        return `${anchorName} + ${offset} דקות`;
      } else {
        return `${anchorName} - ${Math.abs(offset)} דקות`;
      }
    }
  };
  
  const formatValidDays = (event) => {
    const weekdayNames = {
      0: 'ראשון',
      1: 'שני',
      2: 'שלישי',
      3: 'רביעי',
      4: 'חמישי',
      5: 'שישי',
      6: 'שבת'
    };
    
    const specialDayNames = {
      'rosh_chodesh': 'ר״ח',
      'chanukah': 'חנוכה',
      'purim': 'פורים',
      'pesach': 'פסח',
      'shavuot': 'שבועות',
      'sukkot': 'סוכות',
      'yom_kippur': 'יום כיפור',
      'rosh_hashanah': 'ר״ה',
      'fast_days': 'צומות'
    };
    
    if (!event.valid_on || event.valid_on.length === 0) {
      return "כל הימים";
    }
    
    // Count weekdays
    const weekdays = event.valid_on
      .filter(item => item.type === 'weekday')
      .map(item => item.value);
    
    // Count special days
    const specialDays = event.valid_on
      .filter(item => item.type === 'special')
      .map(item => specialDayNames[item.value] || item.value);
    
    let result = [];
    
    // If all weekdays are selected (0-6)
    if (weekdays.length === 7) {
      result.push("כל ימי השבוע");
    } else if (weekdays.length > 0) {
      // List the weekdays
      result.push(weekdays.map(day => weekdayNames[day] || day).join(', '));
    }
    
    // Add special days if any
    if (specialDays.length > 0) {
      result.push(specialDays.join(', '));
    }
    
    return result.join(', ');
  };
  
  const filteredEvents = events.filter(event => {
    if (activeTab === "prayers") {
      return event.type === "prayer";
    } else {
      return event.type === "lesson";
    }
  });
  
  return (
    <div className="max-w-6xl mx-auto">
      <Toaster />
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">ניהול לוח זמנים</h1>
          <p className="text-gray-500">ניהול תפילות ושיעורים בבית הכנסת</p>
        </div>
        
        <Button 
          className="bg-[#F59E0B] hover:bg-[#D97706]"
          onClick={handleAddNew}
        >
          <Plus className="ml-2 h-4 w-4" />
          הוסף חדש
        </Button>
      </div>
      
      <Card className="border-0 shadow-md bg-white">
        <CardHeader className="border-b">
          <CardTitle>
            <Tabs defaultValue="prayers" onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="prayers">תפילות</TabsTrigger>
                <TabsTrigger value="lessons">שיעורים</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#F59E0B]" />
                <span className="mt-2">טוען נתונים...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{activeTab === "prayers" ? "שם התפילה" : "שם השיעור"}</TableHead>
                    {activeTab === "prayers" && <TableHead>סוג</TableHead>}
                    <TableHead>זמן</TableHead>
                    <TableHead>ימים תקפים</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={activeTab === "prayers" ? 5 : 4} className="text-center py-8 text-gray-500">
                        {activeTab === "prayers" ? "לא נמצאו תפילות" : "לא נמצאו שיעורים"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map(event => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        
                        {activeTab === "prayers" && (
                          <TableCell>
                            {event.prayer_type === 'shacharit' && 'שחרית'}
                            {event.prayer_type === 'mincha' && 'מנחה'}
                            {event.prayer_type === 'arvit' && 'ערבית'}
                            {event.prayer_type === 'musaf' && 'מוסף'}
                            {event.prayer_type === 'other' && 'אחר'}
                            {!event.prayer_type && '-'}
                          </TableCell>
                        )}
                        
                        <TableCell className="flex items-center">
                          <Clock className="ml-2 h-4 w-4 text-gray-500" />
                          {formatTime(event)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="max-w-xs truncate" title={formatValidDays(event)}>
                            {formatValidDays(event)}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(event)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(event)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <EventDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
        editingEvent={editingEvent}
      />
    </div>
  );
}