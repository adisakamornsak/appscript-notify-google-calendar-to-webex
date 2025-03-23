function getTodayEvents() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const webexRoomId = 'YOUR_WEBEX_ROOM_ID';

  const calendarId = 'YOUR_GOOGLE_CALENDAR_ID@group.calendar.google.com';
  const calendar = CalendarApp.getCalendarById(calendarId);
  
  if (!calendar) {
    Logger.log('ไม่พบปฏิทิน กรุณาตรวจสอบ Calendar ID');
    return;
  }
  
  // Get calendar events
  const events = calendar.getEvents(startOfDay, endOfDay);

  // Format events for Webex message
  let messageText = `ปฏิทิน ${calendar.getName()} ของวันที่ ${today.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} :\n\n`;
  
  if (events.length === 0) {
    messageText = "";
  } else {
    events.forEach(event => {
       const isAllDay = isAllDayEvent(event);
       let timeDisplay;
       if (isAllDay) {
          timeDisplay = 'ทั้งวัน';
          } else {
          const startTime = event.getStartTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const endTime = event.getEndTime().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          timeDisplay = `${startTime} - ${endTime}`;
        }

      const location = event.getLocation() || 'ไม่ระบุ';
      
      messageText += `กิจกรรม: ${event.getTitle()}\n`;
      messageText += `เวลา: ${timeDisplay}\n`;
      messageText += `สถานที่: ${location}\n`;
      messageText += `รายละเอียด: ${event.getDescription() || 'ไม่ระบุ'}\n\n`;
    });
    
    messageText += `********************`
    Logger.log(messageText);
    callWebexBotAPI(webexRoomId,messageText)
  }
}

function isAllDayEvent(event) {
  const startTime = event.getStartTime();
  const endTime = event.getEndTime();
  
  // Check if event starts at midnight and ends at midnight
  const isStartMidnight = startTime.getHours() === 0 && 
                         startTime.getMinutes() === 0 && 
                         startTime.getSeconds() === 0;
  
  const isEndMidnight = endTime.getHours() === 0 && 
                       endTime.getMinutes() === 0 && 
                       endTime.getSeconds() === 0;
  
  // Check if event duration is exactly 24 hours or multiple of 24 hours
  const durationHours = (endTime - startTime) / (1000 * 60 * 60);
  const isFullDayDuration = durationHours % 24 === 0;
  
  return isStartMidnight && isEndMidnight && isFullDayDuration;
}

function callWebexBotAPI(roomId, text) {
  const url = 'https://webexapis.com/v1/messages';
  const bearerToken = 'YOUR_WEBEX_ACCESS_TOKEN';
  var payload = {
    "roomId": roomId,
    "text": text
  };

  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': {
      'Authorization': 'Bearer ' + bearerToken
    },
    'payload': JSON.stringify(payload)
  };
  var response = UrlFetchApp.fetch(url, options);
  //var data = JSON.parse(response.getContentText());
  //Logger.log(data);
}
