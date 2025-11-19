import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaGlobe,
  FaSpinner,
  FaTimes,
  FaChevronDown
} from "react-icons/fa"
import { collection, addDoc, serverTimestamp, getDocs, query, where, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "../firebase"
import { getBlockedSlotsForDate } from "../services/blockedSlotsService"

// Time zones
export const regionalTimeZones = {
  "Americas": [
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "America/Denver", label: "Mountain Time" }
  ],
  "Europe & Africa": [
    { value: "Europe/London", label: "London, UK" },
    { value: "Europe/Paris", label: "Paris, France" },
    { value: "Europe/Berlin", label: "Berlin, Germany" },
  ],
  "Asia & Pacific": [
    { value: "Asia/Karachi", label: "Karachi, Pakistan" },
    { value: "Asia/Kolkata", label: "Kolkata, India" },
    { value: "Asia/Dubai", label: "Dubai, UAE" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Tokyo", label: "Tokyo, Japan" },
  ],
  "Australia & Oceania": [
    { value: "Australia/Sydney", label: "Sydney, Australia" },
    { value: "Australia/Melbourne", label: "Melbourne, Australia" },
    { value: "Australia/Canberra", label: "Canberra, Australia" },
    { value: "Australia/Perth", label: "Perth, Australia" },
    { value: "Pacific/Auckland", label: "Auckland, New Zealand" },
  ]
}

const SimplifiedCalendarScheduler = ({
  selectedEmployee,
  onScheduleSubmit,
  onClose
}) => {
  // Main flow states
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedTimeZone, setSelectedTimeZone] = useState("Asia/Karachi")
  const [showAlternateQuestion, setShowAlternateQuestion] = useState(false)

  // Alternate time states
  const [alternateDate, setAlternateDate] = useState(null)
  const [alternateTime, setAlternateTime] = useState(null)
  const [selectingAlternate, setSelectingAlternate] = useState(false)
  const [alternateOffered, setAlternateOffered] = useState(false) // Track if alternate was offered

  // Other states
  const [timeSlots, setTimeSlots] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)
  const [currentTime, setCurrentTime] = useState("")

  // Calendar navigation
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  // Get current timezone label
  const currentTimezoneLabel = useMemo(() => {
    for (const region of Object.values(regionalTimeZones)) {
      const found = region.find(tz => tz.value === selectedTimeZone)
      if (found) return found.label
    }
    return selectedTimeZone
  }, [selectedTimeZone])

  // Update current time display
  useEffect(() => {
    if (!selectedTimeZone) return

    const updateClock = () => {
      try {
        const now = new Date()
        const formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: selectedTimeZone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
        setCurrentTime(formatter.format(now))
      } catch (error) {
        console.error("Invalid time zone:", selectedTimeZone, error)
      }
    }

    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [selectedTimeZone])

  const formatDateLocal = useCallback((date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])

  // const generateTimeSlots = useCallback(async (date, timeZone = selectedTimeZone) => {
  //   const slots = []
  //   const startHour = 9 // 9 AM
  //   const endHour = 21 // 9 PM
  //   const dateString = formatDateLocal(date)

  //   try {
  //     const blockedSlotsForDate = await getBlockedSlotsForDate(dateString)
  //     console.log("Block Slots", blockedSlotsForDate); 

  //     for (let hour = startHour; hour <= endHour; hour++) {
  //       const time24 = `${hour.toString().padStart(2, "0")}:00:00`
  //       const time12 = new Date(date)
  //       time12.setHours(hour, 0, 0, 0)

  //       const displayTime = time12.toLocaleTimeString("en-US", {
  //         hour: "numeric",
  //         minute: "2-digit",
  //         hour12: true,
  //         timeZone: timeZone,
  //       })

  //       const isBlocked = blockedSlotsForDate.some((slot) => slot.time === time24)

  //       slots.push({
  //         systemTime: time24,
  //         displayTime: displayTime,
  //         isAvailable: !isBlocked,
  //       })
  //     }
  //   } catch (error) {
  //     console.error("Error generating slots:", error)
  //     // Fallback
  //     for (let hour = startHour; hour <= endHour; hour++) {
  //       const time12 = new Date(date)
  //       time12.setHours(hour, 0, 0, 0)
  //       slots.push({
  //         systemTime: `${hour.toString().padStart(2, "0")}:00:00`,
  //         displayTime: time12.toLocaleTimeString("en-US", {
  //           hour: "numeric",
  //           minute: "2-digit",
  //           hour12: true,
  //           timeZone: timeZone,
  //         }),
  //         isAvailable: true,
  //       })
  //     }
  //   }

  //   return slots
  // }, [selectedTimeZone, formatDateLocal])


  // STEP 5: Handle "No" - save to Firebase (DEFINE THIS FIRST)
  const [bookedDates, setBookedDates] = useState({})
  const generateTimeSlots = useCallback(async (date, timeZone = selectedTimeZone) => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM
    const dateString = formatDateLocal(date);

    try {
      const blockedSlotsForDate = await getBlockedSlotsForDate(dateString);
      const bookedTimesForDate = bookedDates[dateString] || [];

      for (let hour = startHour; hour <= endHour; hour++) {
        const time24 = `${hour.toString().padStart(2, "0")}:00:00`;
        const time12 = new Date(date);
        time12.setHours(hour, 0, 0, 0);

        const displayTime = time12.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
          timeZone,
        });

        const isBlocked =
          blockedSlotsForDate.some((slot) => slot.time === time24) ||
          bookedTimesForDate.includes(time24);

        slots.push({
          systemTime: time24,
          displayTime,
          isAvailable: !isBlocked,
        });
      }
    } catch (error) {
      console.error("Error generating slots:", error);
    }

    return slots;
  }, [selectedTimeZone, formatDateLocal, bookedDates]);

  const handleNoAlternate = useCallback(async () => {
    setIsSubmitting(true)
    setError('')

    try {
      // Get client data from localStorage
      const storedUser = JSON.parse(localStorage.getItem("clientUser"))
      // Convert selected date + time to UTC
      const localDateTime = new Date(`${formatDateLocal(selectedDate)}T${selectedTime}`);
      const utcTime = localDateTime.toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      // Create interview data object
      const interviewData = {
        clientId: storedUser?.clientId || "882Fgk08q4e8HBYonUeI",
        clientName: storedUser?.clientName || "HBL",
        employeeId: selectedEmployee?.id || "",
        employeeName: selectedEmployee?.name || 'Candidate',
        employeeEmail: selectedEmployee?.email || '',
        primaryDate: formatDateLocal(selectedDate),
        primaryTime: selectedTime,
        primaryTimeUTC: utcTime,
        primaryTimeZone: selectedTimeZone,
        alternateDate: alternateDate ? formatDateLocal(alternateDate) : null,
        alternateTime: alternateTime || null,
        alternateTimeZone: alternateTime ? selectedTimeZone : null,
        status: "In Process",
        createdAt: serverTimestamp(),
        scheduledBy: 'client',
        clientUserId: storedUser?.clientId,
        clientUserEmail: storedUser?.email,
      }

      // Add to Firestore
      await addDoc(collection(db, "scheduledInterviews"), interviewData)

      // Call the success callback if provided
      if (onScheduleSubmit) {
        onScheduleSubmit(interviewData)
      }

      setIsSuccess(true)

    } catch (error) {
      console.error('Error scheduling interview:', error)
      setError('Failed to schedule interview. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedDate, selectedTime, alternateDate, alternateTime, selectedEmployee, selectedTimeZone, formatDateLocal, onScheduleSubmit])

  const handleTimeZoneSelect = useCallback(
    async (timezone) => {
      setSelectedTimeZone(timezone)
      setShowRegionDropdown(false)

      // Regenerate time slots for current date with new timezone
      const currentDate = selectingAlternate ? alternateDate : selectedDate
      if (currentDate) {
        const slots = await generateTimeSlots(currentDate, timezone)
        setTimeSlots(slots)
      }
    },
    [selectedDate, alternateDate, selectingAlternate, generateTimeSlots],
  )

  const days = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const daysArray = []

    for (let i = 0; i < startingDay; i++) {
      daysArray.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      daysArray.push(date)
    }

    return daysArray
  }, [currentMonth, currentYear])

  // const [bookedDates, setBookedDates] = useState({})
  // useEffect(() => {
  //   console.log(selectedEmployee, "Selected Employee")
  // const fetchBookedDates = async () => {
  //   if (!selectedEmployee?.id) return;

  //   try {
  //     const q = query(
  //       collection(db, "scheduledInterviews"),
  //       where("employeeId", "==", selectedEmployee.id)
  //     );

  //     const querySnapshot = await getDocs(q);
  //     const dates = querySnapshot.docs.map(doc => doc.data().primaryDate);
  //     setBookedDates(dates);
  //     console.log("Booked Dates for Employee:", dates);
  //   } catch (error) {
  //     console.error("Error fetching booked dates:", error);
  //   }
  // };
  // fetchBookedDates();
  // }, [selectedEmployee?.id]);
  useEffect(() => {
    if (!selectedEmployee?.id) return;

    const fetchBookedData = async () => {
      try {
        const q = query(
          collection(db, "scheduledInterviews"),
          where("employeeId", "==", selectedEmployee.id)
        );
        const querySnapshot = await getDocs(q);

        const dataMap = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const date = data.primaryDate;
          const time = data.primaryTime;

          if (!dataMap[date]) dataMap[date] = [];
          if (time) dataMap[date].push(time);
        });

        setBookedDates(dataMap);
        console.log("Booked Data:", dataMap);
      } catch (error) {
        console.error("Error fetching booked data:", error);
      }
    };

    fetchBookedData();
  }, [selectedEmployee?.id]);

  //   const isDateDisabled = useCallback((date) => {
  //   if (!date) return true

  //   const today = new Date()
  //   today.setHours(0, 0, 0, 0)

  //   // Disable past dates
  //   if (date < today) return true

  //   // Disable weekends
  //   const dayOfWeek = date.getDay()
  //   if (dayOfWeek === 0 || dayOfWeek === 6) return true

  //   // Disable booked dates (from Firestore)
  //   const dateStr = formatDateLocal(date)
  //   if (bookedDates.includes(dateStr)) return true

  //   return false
  // }, [bookedDates, formatDateLocal])
  const isDateDisabled = useCallback((date) => {
    if (!date) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Disable past & weekends
    const dayOfWeek = date.getDay();
    if (date < today || dayOfWeek === 0 || dayOfWeek === 6) return true;

    // Disable if all time slots are booked
    const dateStr = formatDateLocal(date);
    const bookedTimes = bookedDates[dateStr] || [];
    const totalSlots = 13; // 9am–9pm

    return bookedTimes.length >= totalSlots;
  }, [bookedDates, formatDateLocal]);


  const handleDateClick = useCallback(async (date) => {
    if (!date || isDateDisabled(date)) return

    if (selectingAlternate) {
      setAlternateDate(date)
      setAlternateTime(null)
      const slots = await generateTimeSlots(date)
      setTimeSlots(slots)
    } else {
      setSelectedDate(date)
      setSelectedTime(null)
      const slots = await generateTimeSlots(date)
      setTimeSlots(slots)
    }
  }, [isDateDisabled, generateTimeSlots, selectingAlternate])

  const handleTimeClick = useCallback((time) => {
    if (selectingAlternate) {
      setAlternateTime(time)
    } else {
      setSelectedTime(time)
      // STEP 3: After selecting time, show alternate question (ONLY if not already offered)
      if (!alternateOffered) {
        setShowAlternateQuestion(true)
      } else {
        // If alternate was already offered, proceed directly to submission
        handleNoAlternate()
      }
    }
  }, [selectingAlternate, alternateOffered, handleNoAlternate])

  const changeMonth = useCallback((increment) => {
    setCurrentMonth((prev) => {
      let newMonth = prev + increment
      let newYear = currentYear

      if (newMonth < 0) {
        newMonth = 11
        newYear--
      } else if (newMonth > 11) {
        newMonth = 0
        newYear++
      }

      setCurrentYear(newYear)
      return newMonth
    })
  }, [currentYear])

  const monthName = useMemo(
    () =>
      [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ][currentMonth],
    [currentMonth],
  )

  const formatDateDisplay = useCallback((date) => {
    if (!date) return ""
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  // STEP 4: Handle "Yes" to alternate time - ONE TIME OFFER
  const handleYesAlternate = useCallback(() => {
    setSelectingAlternate(true)
    setShowAlternateQuestion(false)
    setAlternateOffered(true) // Mark as offered - only once
    setAlternateDate(null)
    setAlternateTime(null)
  }, [])

  // Reset for new scheduling
  const resetScheduler = useCallback(() => {
    setSelectedDate(null)
    setSelectedTime(null)
    setAlternateDate(null)
    setAlternateTime(null)
    setShowAlternateQuestion(false)
    setSelectingAlternate(false)
    setAlternateOffered(false) // Reset the offer flag
    setIsSuccess(false)
    setError("")
  }, [])

  // Time Zone Selector Component
  const renderTimeZoneSelector = () => (
    <div className="time-zone-selector">
      <FaGlobe className="time-zone-icon" />

      <div className="regional-dropdown-container">
        <button
          className="regional-dropdown-toggle"
          onClick={() => setShowRegionDropdown(!showRegionDropdown)}
        >
          <span>{currentTimezoneLabel}</span>
          <FaChevronDown className={`chevron ${showRegionDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showRegionDropdown && (
          <div className="regional-dropdown-menu">
            {Object.entries(regionalTimeZones).map(([region, timezones]) => (
              <div key={region} className="regional-group">
                <div className="regional-group-header">{region}</div>
                {timezones.map((tz) => (
                  <button
                    key={tz.value}
                    className={`regional-option ${selectedTimeZone === tz.value ? "selected" : ""}`}
                    onClick={() => handleTimeZoneSelect(tz.value)}
                  >
                    <span>{tz.label}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="current-time-display">
        <FaClock />
        <span>Current: {currentTime}</span>
      </div>
    </div>
  )

  // STEP 1: Calendar View
  const renderCalendar = () => (
    <div className="calendar-view">
      <div className="scheduler-icon">
        <FaCalendarAlt />
      </div>

      {renderTimeZoneSelector()}

      <div className="calendar-header">
        <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
          <FaChevronLeft />
        </button>
        <h3>{monthName} {currentYear}</h3>
        <button className="month-nav-btn" onClick={() => changeMonth(1)}>
          <FaChevronRight />
        </button>
      </div>

      <div className="calendar-grid-container">
        <div className="day-names">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="day-name">{day}</div>
          ))}
        </div>

        <div className="days-grid">
          {days.map((date, index) => (
            <button
              key={index}
              className={`day-cell ${!date ? "empty" : ""} ${date && isDateDisabled(date) ? "disabled" : ""}`}
              onClick={() => handleDateClick(date)}
              disabled={!date || isDateDisabled(date)}
            >
              {date && (
                <>
                  <div className="day-number">{date.getDate()}</div>
                </>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // STEP 2 & 4: Time Slot Selection
  const renderTimeSlots = () => {
    const currentDate = selectingAlternate ? alternateDate : selectedDate
    const currentTimeSelected = selectingAlternate ? alternateTime : selectedTime

    // If we're selecting alternate but no date is selected yet, show calendar
    if (selectingAlternate && !alternateDate) {
      return (
        <div className="calendar-view">
          <h3>Select Alternate Date</h3>

          {renderTimeZoneSelector()}

          <div className="calendar-header">
            <button className="month-nav-btn" onClick={() => changeMonth(-1)}>
              <FaChevronLeft />
            </button>
            <h3>{monthName} {currentYear}</h3>
            <button className="month-nav-btn" onClick={() => changeMonth(1)}>
              <FaChevronRight />
            </button>
          </div>

          <div className="calendar-grid-container">
            <div className="day-names">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="day-name">{day}</div>
              ))}
            </div>

            <div className="days-grid">
              {days.map((date, index) => (
                <button
                  key={index}
                  className={`day-cell ${!date ? "empty" : ""} ${date && isDateDisabled(date) ? "disabled" : ""}`}
                  onClick={() => handleDateClick(date)}
                  disabled={!date || isDateDisabled(date)}
                >
                  {date && (
                    <>
                      <div className="day-number">{date.getDate()}</div>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="time-slot-actions">
            <button className="back-btn" onClick={() => {
              setSelectingAlternate(false)
              setShowAlternateQuestion(true)
            }}>
              Back to Confirmation
            </button>
          </div>
        </div>
      )
    }

    // Otherwise show time slots for the selected date
    return (
      <div className="time-slot-view">
        <h3>
          {selectingAlternate ? "Select Alternate Time" : "Select a Time Slot"}
        </h3>
        <p className="selected-date">{formatDateDisplay(currentDate)}</p>

        {renderTimeZoneSelector()}

        <div className="time-slots-grid">
          {timeSlots.length > 0 ? (
            timeSlots.map((slot, index) => (
              <button
                key={index}
                className={`time-slot-btn ${!slot.isAvailable ? "blocked" : ""} ${currentTimeSelected === slot.systemTime ? "selected" : ""}`}
                disabled={!slot.isAvailable}
                onClick={() => slot.isAvailable && handleTimeClick(slot.systemTime)}
              >
                {slot.displayTime}
                {!slot.isAvailable && <span className="blocked-label"> Booked</span>}
              </button>
            ))
          ) : (
            <p>No available time slots for this date</p>
          )}
        </div>

        <div className="time-slot-actions">
          <button className="back-btn" onClick={() => {
            if (selectingAlternate) {
              // If we're on time slots for alternate, go back to alternate calendar
              setAlternateDate(null)
              setAlternateTime(null)
            } else {
              // If we're on primary time slots, go back to primary calendar
              setSelectedDate(null)
              setSelectedTime(null)
            }
          }}>
            {selectingAlternate ? "Back to Alternate Calendar" : "Back to Calendar"}
          </button>

          {selectingAlternate && alternateTime && (
            <button
              className="confirm-btn"
              onClick={() => {
                setSelectingAlternate(false)
                setShowAlternateQuestion(true)
              }}
            >
              Confirm Alternate Time
            </button>
          )}
        </div>
      </div>
    )
  }

  // STEP 3: Alternate Question (ONE TIME ONLY)
  const renderAlternateQuestion = () => (
    <div className="alternate-question-section">
      <h3>Schedule Confirmation</h3>

      <div className="selected-slot-info">
        <p><strong>Primary Time Selected:</strong></p>
        <p className="slot-details">
          {formatDateDisplay(selectedDate)}, {selectedTime} ({currentTimezoneLabel})
        </p>

        {alternateDate && alternateTime && (
          <>
            <p><strong>Alternate Time Selected:</strong></p>
            <p className="slot-details">
              {formatDateDisplay(alternateDate)}, {alternateTime} ({currentTimezoneLabel})
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="error-notification">
          <span>{error}</span>
        </div>
      )}

      <div className="alternate-question-main">
        {!alternateDate || !alternateTime ? (
          // First time asking - offer alternate
          <>
            <p>
              <strong>Do you want to offer the candidate another date and time for interview too, for his convenience?</strong>
            </p>
            <div className="yes-no-buttons-large">
              <button className="yes-btn" onClick={handleYesAlternate}>
                Yes, select alternate date & time
              </button>
              <button
                className="no-btn"
                onClick={handleNoAlternate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" />
                    Scheduling...
                  </>
                ) : (
                  "No, schedule only this time"
                )}
              </button>
            </div>
          </>
        ) : (
          // Alternate already selected - just show confirmation
          <>
            <p>
              <strong>Confirm your interview schedule:</strong>
            </p>
            <div className="yes-no-buttons-large">
              <button
                className="no-btn"
                onClick={handleNoAlternate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" />
                    Scheduling...
                  </>
                ) : (
                  "Confirm Schedule"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Success Message
  const renderSuccess = () => (
    <div className="success-message">
      <h3>Interview Scheduled Successfully!</h3>
      <p>Your interview has been scheduled.</p>
      <div className="button-container">
        <button className="primary-btn" onClick={resetScheduler}>
          Schedule Another Interview
        </button>
        <button className="back-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )

  // Main render with exact flow
  return (
    <div className="simplified-calendar-scheduler">
      {isSuccess ? (
        renderSuccess()
      ) : !selectedDate ? (
        // STEP 1: Primary Calendar
        renderCalendar()
      ) : !selectedTime ? (
        // STEP 2: Primary Time Slots
        renderTimeSlots()
      ) : showAlternateQuestion ? (
        // STEP 3: Alternate Question
        renderAlternateQuestion()
      ) : selectingAlternate ? (
        // STEP 4: Alternate Date & Time Selection
        renderTimeSlots()
      ) : (
        // Fallback
        renderCalendar()
      )}

      <style jsx>{`
        .simplified-calendar-scheduler {
          max-width: 500px;
          margin: 0 auto;
          font-family: 'Arial', sans-serif;
        }
        
        .calendar-view {
          text-align: center;
        }
        
        .scheduler-icon {
          font-size: 2rem;
          color: #2A2D7C;
          margin-bottom: 1rem;
        }
        
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          margin-bottom: 1rem;
        }
        
        .month-nav-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #2A2D7C;
          padding: 0.5rem;
        }
        
        .calendar-grid-container {
          overflow-x: auto;
        }
        
        .day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #2A2D7C;
        }
        
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 5px;
        }
        
        .day-cell {
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          background: none;
          border: 1px solid transparent;
        }
        
        .day-cell:not(.empty):not(.disabled):hover {
          background-color: #e1f5fe;
        }
        
        .day-cell.disabled {
          color: #ccc;
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        /* Time Zone Selector */
        .time-zone-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .regional-dropdown-container {
          position: relative;
        }
        
        .regional-dropdown-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }
        
        .regional-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          z-index: 100;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .regional-group-header {
          padding: 8px 12px;
          background-color: #f8f9fa;
          font-weight: 600;
          color: #2A2D7C;
        }
        
        .regional-option {
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: white;
          cursor: pointer;
        }
        
        .regional-option:hover {
          background-color: #f0f8ff;
        }
        
        .regional-option.selected {
          background-color: #06a3c2;
          color: white;
        }
        
        .current-time-display {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.9rem;
          color: #666;
        }
        
        .time-slot-view {
          text-align: center;
        }
        
        .selected-date {
          color: #2A2D7C;
          font-weight: bold;
          margin-bottom: 1.5rem;
        }
        
        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin: 20px 0;
        }
        
        .time-slot-btn {
          padding: 10px;
          background-color: #06a3c2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .time-slot-btn:hover:not(:disabled) {
          background-color: #2A2D7C;
        }
        
        .time-slot-btn.selected {
          background-color: #2A2D7C;
          transform: scale(1.05);
        }
        
        .time-slot-btn.blocked {
          background-color: #f8d7da;
          color: #721c24;
          cursor: not-allowed;
        }
        
        .time-slot-actions {
          display: flex;
          justify-content: center;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }
        
        .back-btn, .confirm-btn {
          padding: 10px 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          background: white;
          min-width: 120px;
        }
        
        .back-btn:hover {
          background: #f5f5f5;
        }
        
        .confirm-btn {
          background: #06a3c2;
          color: white;
          border: none;
        }
        
        .confirm-btn:hover {
          background: #2A2D7C;
        }
        
        .alternate-question-section {
          text-align: center;
        }
        
        .selected-slot-info {
          background: #f0f8ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 25px;
        }
        
        .slot-details {
          font-size: 1.1rem;
          font-weight: bold;
          color: #2a2d7c;
          margin-top: 8px;
        }
        
        .alternate-question-main {
          margin: 30px 0;
        }
        
        .yes-no-buttons-large {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .yes-btn, .no-btn {
          padding: 15px 20px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .yes-btn:hover {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }
        
        .no-btn:hover:not(:disabled) {
          background: #f44336;
          color: white;
          border-color: #f44336;
        }
        
        .no-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .success-message {
          text-align: center;
        }
        
        .primary-btn {
          padding: 12px 24px;
          background-color: #2A2D7C;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
        }
        
        .error-notification {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default SimplifiedCalendarScheduler