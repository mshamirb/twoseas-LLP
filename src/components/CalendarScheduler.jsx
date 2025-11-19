import React, { useState, useEffect, useCallback, useMemo } from "react"
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaGlobe,
  FaExclamationTriangle,
  FaSpinner,
  FaTimes,
  FaChevronDown,
  FaEdit
} from "react-icons/fa"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase"
import { niches } from "../pages/AdminDashboard/constants"
import { getBlockedSlotsForDate } from "../services/blockedSlotsService"
import emailjs from "emailjs-com"

const EMAILJS_SERVICE_ID = "service_wjrb0qk"
const EMAILJS_TEMPLATE_ID = "template_177shrs"
const EMAILJS_PUBLIC_KEY = "vkVckeGL1JQx-x4_q"

// Regional time zones organized by region
export const regionalTimeZones = {
  "Americas": [
    { value: "America/New_York", label: "Eastern Time" },
    { value: "America/Chicago", label: "Central Time" },
    { value: "America/Denver", label: "Mountain Time" },
    { value: "America/Los_Angeles", label: "Pacific Time" },
    { value: "America/Anchorage", label: "Alaska Time" },
    { value: "Pacific/Honolulu", label: "Hawaii Time" },
    { value: "America/Toronto", label: "Toronto, Canada" },
    { value: "America/Vancouver", label: "Vancouver, Canada" },
    { value: "America/Mexico_City", label: "Mexico City, Mexico" },
    { value: "America/Sao_Paulo", label: "São Paulo, Brazil" },
    { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires, Argentina" },
  ],
  "Europe & Africa": [
    { value: "Europe/London", label: "London, UK" },
    { value: "Europe/Paris", label: "Paris, France" },
    { value: "Europe/Berlin", label: "Berlin, Germany" },
    { value: "Europe/Moscow", label: "Moscow, Russia" },
    { value: "Europe/Istanbul", label: "Istanbul, Turkey" },
    { value: "Africa/Cairo", label: "Cairo, Egypt" },
    { value: "Africa/Johannesburg", label: "Johannesburg, South Africa" },
    { value: "Africa/Lagos", label: "Lagos, Nigeria" },
  ],
  "Asia & Pacific": [
    { value: "Asia/Dubai", label: "Dubai, UAE" },
    { value: "Asia/Karachi", label: "Karachi, Pakistan" },
    { value: "Asia/Kolkata", label: "Kolkata, India" },
    { value: "Asia/Dhaka", label: "Dhaka, Bangladesh" },
    { value: "Asia/Bangkok", label: "Bangkok, Thailand" },
    { value: "Asia/Singapore", label: "Singapore" },
    { value: "Asia/Shanghai", label: "Shanghai, China" },
    { value: "Asia/Tokyo", label: "Tokyo, Japan" },
    { value: "Asia/Seoul", label: "Seoul, South Korea" },
    { value: "Australia/Sydney", label: "Sydney, Australia" },
    { value: "Pacific/Auckland", label: "Auckland, New Zealand" },
  ],
  "Other Regions": [
    { value: "UTC", label: "Coordinated Universal Time (UTC)" },
    { value: "Etc/GMT+12", label: "International Date Line West (GMT-12)" },
    { value: "Pacific/Midway", label: "Midway Island (GMT-11)" },
    { value: "Pacific/Guam", label: "Guam (GMT+10)" },
  ]
}

// Simple Input component
const Input = ({ placeholder, value, onChange, className, ...props }) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
}

// World Clock Component
const WorldClock = ({ isOpen, onClose, timeFormat, onTimeZoneSelect }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [is24Hour, setIs24Hour] = useState(timeFormat === "24h")
  const [currentTimes, setCurrentTimes] = useState({})
  const [selectedTimeZone, setSelectedTimeZone] = useState(null)

  const allTimeZones = Object.values(regionalTimeZones).flat()

  useEffect(() => {
    if (!isOpen) return

    const updateTimes = () => {
      const times = {}
      allTimeZones.forEach((tz) => {
        const now = new Date()
        const timeString = now.toLocaleTimeString("en-US", {
          timeZone: tz.value,
          hour12: !is24Hour,
          hour: "numeric",
          minute: "2-digit",
        })
        times[tz.value] = timeString
      })
      setCurrentTimes(times)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [allTimeZones, is24Hour, isOpen])

  const filteredRegions = Object.entries(regionalTimeZones).reduce(
    (acc, [region, zones]) => {
      const filteredZones = zones.filter(
        (zone) =>
          zone.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          region.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      if (filteredZones.length > 0) {
        acc[region] = filteredZones
      }
      return acc
    },
    {}
  )

  const handleTimeZoneClick = (timezone) => {
    setSelectedTimeZone(timezone)
    if (onTimeZoneSelect) {
      onTimeZoneSelect(timezone)
    }
  }

  if (!isOpen) return null

  return (
    <div className="world-clock-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h3>World Clock</h3>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div className="mb-4">
            <Input
              placeholder="Search time zones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full"
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-600 uppercase">TIME ZONE</h4>
            <div className="flex items-center rounded-full bg-gray-200 p-1">
              <button
                onClick={() => setIs24Hour(false)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${!is24Hour ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                  }`}
              >
                am/pm
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <button
                onClick={() => setIs24Hour(true)}
                className={`rounded-full px-3 py-1 text-sm font-medium ${is24Hour ? "bg-white text-gray-900 shadow-sm" : "text-gray-600"
                  }`}
              >
                24h
              </button>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(filteredRegions).map(([region, zones]) => (
              <div key={region}>
                <h4 className="mb-2 text-sm font-semibold text-gray-900 uppercase">{region}</h4>
                <div className="space-y-1">
                  {zones.map((zone) => (
                    <button
                      key={zone.value}
                      onClick={() => handleTimeZoneClick(zone.value)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left rounded ${selectedTimeZone === zone.value
                        ? "bg-teal-600 text-white"
                        : "bg-white text-gray-900 hover:bg-gray-100"
                        }`}
                    >
                      <span className="text-sm">{zone.label}</span>
                      <span className="text-sm tabular-nums">{currentTimes[zone.value] || "--:--"}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .world-clock-modal {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-overlay {
          position: absolute;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(2px);
        }

        .modal-content {
          background: #ffffff;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow: hidden;
          z-index: 1001;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          animation: fadeInUp 0.25s ease-out;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #2a2d7c;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
          color: #6b7280;
          transition: color 0.2s ease;
        }

        .close-btn:hover {
          color: #111827;
        }

        .modal-body {
          padding: 1.25rem;
          overflow-y: auto;
          flex: 1;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

const CalendarScheduler = ({
  onDateSelected,
  onScheduleSubmit,
  unavailableDates = [],
  title = "Schedule a Meeting",
  submitButtonText = "Book Demo",
  successMessage = "We'll contact you shortly to confirm your appointment.",
  workingHours = { start: 9, end: 21 },
  prefillData = {},
  isAdminPanel = false,
  selectedEmployee = null,
  isAlternate = false,
  primarySlot = null,
  isAlternateScheduler = false,
  onAlternateSlotSelect = null,
  fromClientDashboard = false,
}) => {
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedTimeZone, setSelectedTimeZone] = useState("Asia/Karachi")
  const [errors, setErrors] = useState({})
  const [error, setError] = useState("")
  const [currentTime, setCurrentTime] = useState("")
  const [userDetails, setUserDetails] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    website: "",
    niche: "",
    details: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [timeSlots, setTimeSlots] = useState([])
  const [blockedSlots, setBlockedSlots] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [showWorldClock, setShowWorldClock] = useState(false)
  const [timeFormat, setTimeFormat] = useState("12h")
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)
  const [currentTimes, setCurrentTimes] = useState({});

  // New state for alternate scheduling
  const [offerAlternate, setOfferAlternate] = useState(null);
  const [alternateSlot, setAlternateSlot] = useState(null);
  const [showAlternateScheduler, setShowAlternateScheduler] = useState(false);
  const [showAlternateModal, setShowAlternateModal] = useState(false);

  // Add auto-submit effect for client dashboard
  useEffect(() => {
    if (fromClientDashboard && selectedDate && selectedTime && !isSuccess && !isSubmitting) {
      handleAutoSubmit();
    }
  }, [fromClientDashboard, selectedDate, selectedTime, isSuccess, isSubmitting]);

  // Add auto-submit function
  const handleAutoSubmit = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Get client data from localStorage
      const storedUser = JSON.parse(localStorage.getItem("clientUser"));

      // Create interview data object for client dashboard
      const interviewData = {
        clientId: storedUser?.clientId || "882Fgk08q4e8HBYonUeI",
        clientName: storedUser?.clientName || "HBL",
        employeeId: selectedEmployee?.id || "",
        employeeName: selectedEmployee?.name || storedUser?.clientName || 'Client',
        employeeEmail: selectedEmployee?.email || storedUser?.email || '',
        primaryDate: formatDateLocal(selectedDate),
        primaryTime: selectedTime,
        primaryTimeZone: selectedTimeZone,
        alternateDate: alternateSlot ? formatDateLocal(new Date(alternateSlot.date)) : null,
        alternateTime: alternateSlot ? alternateSlot.time : null,
        alternateTimeZone: alternateSlot ? alternateSlot.timeZone : null,
        status: "scheduled",
        createdAt: serverTimestamp(),
        scheduledBy: 'client',
        clientUserId: storedUser?.clientId,
        clientUserEmail: storedUser?.email,
      };

      // Add to Firestore
      await addDoc(collection(db, "scheduledInterviews"), interviewData);

      // Call the success callback if provided
      if (onScheduleSubmit) {
        onScheduleSubmit(interviewData);
      }

      setIsSuccess(true);

    } catch (error) {
      console.error('Error scheduling interview:', error);
      setError('Failed to schedule interview. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (prefillData?.name || prefillData?.email) {
      setUserDetails((prev) => ({
        ...prev,
        name: prefillData.name || prev.name,
        email: prefillData.email || prev.email,
      }));
    }
  }, [prefillData]);


  // Get current timezone label
  const currentTimezoneLabel = useMemo(() => {
    for (const region of Object.values(regionalTimeZones)) {
      const found = region.find(tz => tz.value === selectedTimeZone);
      if (found) return found.label;
    }
    return selectedTimeZone;
  }, [selectedTimeZone]);

  // Update current times for all timezones
  useEffect(() => {
    const updateTimes = () => {
      const times = {};
      Object.values(regionalTimeZones).flat().forEach((tz) => {
        const now = new Date();
        const timeString = now.toLocaleTimeString("en-US", {
          timeZone: tz.value,
          hour12: timeFormat === "12h",
          hour: "numeric",
          minute: "2-digit",
        });
        times[tz.value] = timeString;
      });
      setCurrentTimes(times);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [timeFormat]);

  useEffect(() => {
    if (isAdminPanel && selectedEmployee?.name && selectedEmployee?.email) {
      setUserDetails((prev) => ({
        ...prev,
        name: selectedEmployee.name,
        email: selectedEmployee.email,
      }));
    }
  }, [isAdminPanel, selectedEmployee]);

  const formatDateLocal = useCallback((date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }, [])

  const generateTimeSlots = useCallback(
    async (date, timeZone = selectedTimeZone) => {
      const slots = []
      const startHour = workingHours.start
      const endHour = workingHours.end
      const dateString = formatDateLocal(date)

      try {
        const blockedSlotsForDate = await getBlockedSlotsForDate(dateString)

        for (let hour = startHour; hour <= endHour; hour++) {
          const time24 = `${hour.toString().padStart(2, "0")}:00:00`
          const time12 = new Date(date)
          time12.setHours(hour, 0, 0, 0)

          const displayTime = time12.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: timeZone,
          })

          const isBlocked = blockedSlotsForDate.some((slot) => slot.time === time24)

          slots.push({
            systemTime: time24,
            displayTime: displayTime,
            isAvailable: !isBlocked,
          })
        }
      } catch (error) {
        console.error("Error generating slots:", error)
        // Fallback - return all slots as available
        for (let hour = startHour; hour <= endHour; hour++) {
          const time12 = new Date(date)
          time12.setHours(hour, 0, 0, 0)
          slots.push({
            systemTime: `${hour.toString().padStart(2, "0")}:00:00`,
            displayTime: time12.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
              timeZone: timeZone,
            }),
            isAvailable: true,
          })
        }
      }

      return slots
    },
    [workingHours.start, workingHours.end, selectedTimeZone, formatDateLocal],
  )

  const handleTimeZoneSelect = useCallback(
    async (timezone) => {
      setSelectedTimeZone(timezone);
      setShowRegionDropdown(false);

      if (selectedDate) {
        const slots = await generateTimeSlots(selectedDate, timezone);
        setTimeSlots(slots);
      }
    },
    [selectedDate, generateTimeSlots],
  );

  const detectUserLocation = useCallback(async () => {
    setIsDetectingLocation(true)
    try {
      const response = await fetch("https://ipapi.co/json/")
      const data = await response.json()

      const locationData = {
        country: data.country_name,
        city: data.city,
        region: data.region,
        timezone: data.timezone,
        source: "ip",
      }
      setUserLocation(locationData)

      if (data.timezone) {
        setSelectedTimeZone(data.timezone)
      }
    } catch (error) {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const fallbackLocation = {
        timezone: browserTimezone,
        source: "browser",
      }
      setUserLocation(fallbackLocation)

      if (browserTimezone) {
        setSelectedTimeZone(browserTimezone)
      }
    } finally {
      setIsDetectingLocation(false)
    }
  }, [])

  useEffect(() => {
    detectUserLocation()
  }, [detectUserLocation])

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

  const convertTimeToTimezone = useCallback((time, fromTimezone, toTimezone) => {
    try {
      const date = new Date()
      const [timePart, period] = time.split(" ")
      let [hours, minutes] = timePart.split(":").map(Number)

      if (period === "PM" && hours !== 12) hours += 12
      if (period === "AM" && hours === 12) hours = 0

      date.setHours(hours, minutes || 0, 0, 0)

      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: toTimezone,
      })
    } catch (error) {
      console.error("Error converting time:", error)
      return time
    }
  }, [])

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target
      setUserDetails((prev) => ({
        ...prev,
        [name]: value,
      }))
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: "" }))
      }
    },
    [errors],
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

  const isDateDisabled = useCallback(
    (date) => {
      if (!date) return true

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (date < today) return true

      const dayOfWeek = date.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) return true

      const dateString = date.toISOString().split("T")[0]
      if (unavailableDates.includes(dateString)) return true

      return false
    },
    [unavailableDates],
  )

  const handleDateClick = useCallback(
    async (date) => {
      if (!date || isDateDisabled(date)) return

      setSelectedDate(date)
      setSelectedTime(null)
      setIsSuccess(false)

      const slots = await generateTimeSlots(date, selectedTimeZone)
      setTimeSlots(slots)

      if (onDateSelected) {
        onDateSelected(formatDateLocal(date))
      }
    },
    [isDateDisabled, generateTimeSlots, selectedTimeZone, formatDateLocal, onDateSelected],
  )

  const handleTimeClick = useCallback((time) => {
    setSelectedTime(time);

    // If this is alternate scheduler, automatically proceed to show the slot as secondary
    if (isAlternateScheduler) {
      // The selection will be handled in the alternate scheduler's UI
      // No need to show confirmation form
    }
  }, [isAlternateScheduler]);

  const validateForm = useCallback(() => {
    const newErrors = {}

    // Always require name/email
    if (!userDetails.name.trim()) newErrors.name = "Name is required"
    if (!userDetails.email.trim()) newErrors.email = "Email is required"

    // Only enforce phone + niche if NOT alternate
    if (!isAlternate) {
      if (!userDetails.phone.trim()) newErrors.phone = "Phone number is required"
      if (!userDetails.niche) newErrors.niche = "Please select a niche"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [userDetails, isAlternate])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!selectedDate || !selectedTime) {
        setError("Please fill in all required fields");
        return;
      }

      setIsSubmitting(true);
      setError("");

      try {
        // 1️⃣ Build interview data for Firestore
        const interviewData = {
          clientId: "882Fgk08q4e8HBYonUeI",
          clientName: "HBL",
          employeeId: selectedEmployee?.id || "",
          employeeName: selectedEmployee?.name || userDetails.name,
          employeeEmail: selectedEmployee?.email || userDetails.email,
          primaryDate: formatDateLocal(selectedDate),
          primaryTime: selectedTime,
          primaryTimeZone: selectedTimeZone,
          alternateDate: alternateSlot ? formatDateLocal(new Date(alternateSlot.date)) : null,
          alternateTime: alternateSlot ? alternateSlot.time : null,
          alternateTimeZone: alternateSlot ? alternateSlot.timeZone : null,
          status: "scheduled",
          createdAt: serverTimestamp(),
          scheduledBy: "admin"
        };

        // 2️⃣ Save to Firestore
        await addDoc(collection(db, "scheduledInterviews"), interviewData);

        // 3️⃣ Send email via Hostinger PHP
        const emailPayload = new URLSearchParams({
          formType: "Interview Scheduling Form",
          clientId: interviewData.clientId,
          clientName: interviewData.clientName,
          employeeName: interviewData.employeeName,
          employeeEmail: interviewData.employeeEmail,
          primaryDate: interviewData.primaryDate,
          primaryTime: interviewData.primaryTime,
          primaryTimeZone: interviewData.primaryTimeZone,
          alternateDate: interviewData.alternateDate || "",
          alternateTime: interviewData.alternateTime || "",
          alternateTimeZone: interviewData.alternateTimeZone || "",
          status: interviewData.status
        });

        const emailResponse = await fetch("https://twoseas.org/sendMail.php", {
          method: "POST",
          body: emailPayload
        });

        const emailResult = await emailResponse.json();
        if (emailResult.status === "success") {
          console.log("Email sent successfully!");
        } else {
          console.warn("Email failed:", emailResult.message);
        }

        // 4️⃣ Call the success callback if needed
        if (onScheduleSubmit) {
          onScheduleSubmit(interviewData);
        }

        alert("Interview scheduled successfully!");

        // 5️⃣ Reset form
        setSelectedDate(null);
        setSelectedTime(null);
        setAlternateSlot(null);
        setOfferAlternate(null);
        setShowAlternateScheduler(false);

      } catch (error) {
        console.error("Error scheduling interview:", error);
        setError("Failed to schedule interview. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      selectedDate,
      selectedTime,
      userDetails,
      selectedTimeZone,
      selectedEmployee,
      alternateSlot,
      onScheduleSubmit,
      formatDateLocal
    ]
  );


  const changeMonth = useCallback(
    (increment) => {
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
    },
    [currentYear],
  )

  const monthName = useMemo(
    () =>
      [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
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

  // Handle alternate slot selection
  const handleAlternateSlotSelect = useCallback((date, time) => {
    // Ensure date is properly handled
    const dateObj = date instanceof Date ? date : new Date(date);

    const slot = {
      date: dateObj,
      time: time,
      timeZone: selectedTimeZone,
      timeZoneLabel: currentTimezoneLabel
    };

    setAlternateSlot(slot);
    setShowAlternateModal(false);
    setOfferAlternate(true);

    if (onAlternateSlotSelect) {
      onAlternateSlotSelect(slot);
    }
  }, [selectedTimeZone, currentTimezoneLabel, onAlternateSlotSelect]);

  // Edit primary slot
  const handleEditPrimarySlot = useCallback(() => {
    setSelectedDate(null);
    setSelectedTime(null);
    setAlternateSlot(null);
    setOfferAlternate(null);
  }, []);

  // Edit alternate slot
  const handleEditAlternateSlot = useCallback(() => {
    setAlternateSlot(null);
    setShowAlternateScheduler(true);
  }, []);

  {
    showAlternateScheduler && (
      <div className="alternate-scheduler-overlay">
        <div className="alternate-scheduler-modal">
          {/* Modal Header with Close Button */}
          <div className="alternate-scheduler-header">
            <h3>Select Alternate Date & Time</h3>
            <button
              className="close-alternate-btn"
              onClick={() => setShowAlternateScheduler(false)}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Modal Content */}
          <div className="alternate-scheduler-content">
            {!selectedDate ? (
              // Calendar View
              <div className="calendar-view">
                <div className="calendar-header">
                  <button onClick={() => changeMonth(-1)} aria-label="Previous month">
                    <FaChevronLeft />
                  </button>
                  <h3>{monthName} {currentYear}</h3>
                  <button onClick={() => changeMonth(1)} aria-label="Next month">
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
                        disabled={!date || isDateDisabled(date)}
                        onClick={() => handleDateClick(date)}
                      >
                        {date && <div className="day-number">{date.getDate()}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : !selectedTime ? (
              // Time Slot Selection
              <div className="time-slot-view">
                <h3>Select a Time Slot</h3>
                <p className="selected-date">{formatDateDisplay(selectedDate)}</p>

                <div className="time-slots-grid">
                  {timeSlots.length > 0 ? (
                    timeSlots.map((slot, index) => (
                      <button
                        key={index}
                        className={`time-slot-btn ${!slot.isAvailable ? "blocked" : ""}`}
                        disabled={!slot.isAvailable}
                        onClick={() => handleTimeClick(slot.systemTime)}
                      >
                        {slot.displayTime}
                        {!slot.isAvailable && <span className="blocked-label">Booked</span>}
                      </button>
                    ))
                  ) : (
                    <p>No available time slots for this date</p>
                  )}
                </div>

                <button className="back-btn" onClick={() => setSelectedDate(null)}>
                  Back to Calendar
                </button>
              </div>
            ) : (
              // Confirmation Only
              <div className="alternate-confirmation">
                <h4>Confirm Alternate Slot</h4>
                <p className="selected-slot">{formatDateDisplay(selectedDate)}, {selectedTime}</p>

                <div className="confirmation-buttons">
                  <button
                    className="confirm-btn"
                    onClick={() => handleAlternateSlotSelect({ date: selectedDate, time: selectedTime })}
                  >
                    Confirm
                  </button>
                  <button className="back-btn" onClick={() => setSelectedTime(null)}>
                    Back to Time Slots
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }


  // Modified CalendarScheduler for alternate mode - WITH ALL FEATURES
  if (isAlternateScheduler) {
    return (
      <div className="alternate-scheduler">
        <WorldClock
          isOpen={showWorldClock}
          onClose={() => setShowWorldClock(false)}
          timeFormat={timeFormat}
          onTimeZoneSelect={handleTimeZoneSelect}
        />

        <div className="alternate-scheduler-header">
          <h3>Select Alternate Date & Time</h3>
          <button
            className="close-modal-btn"
            onClick={() => setShowAlternateModal(false)}
          >
            <FaTimes />
          </button>
        </div>

        <div className="alternate-scheduler-content">
          {!selectedDate ? (
            // Calendar View for Alternate
            <div className="calendar-view">
              <div className="calendar-header">
                <button onClick={() => changeMonth(-1)} aria-label="Previous month">
                  <FaChevronLeft />
                </button>
                <h3>{monthName} {currentYear}</h3>
                <button onClick={() => changeMonth(1)} aria-label="Next month">
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
                      disabled={!date || isDateDisabled(date)}
                      onClick={() => handleDateClick(date)}
                    >
                      {date && <div className="day-number">{date.getDate()}</div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : !selectedTime ? (
            // Time Slot Selection for Alternate - WITH TIME ZONE SELECTOR
            <div className="time-slot-view">
              {/* Time Zone Selector */}
              <div className="time-zone-selector">
                <FaGlobe className="time-zone-icon" aria-hidden="true" />

                {/* Time format toggle */}
                <div className="time-format-toggle">
                  <button
                    onClick={() => setTimeFormat("12h")}
                    className={timeFormat === "12h" ? "active" : ""}
                  >
                    12h
                  </button>
                  <button
                    onClick={() => setTimeFormat("24h")}
                    className={timeFormat === "24h" ? "active" : ""}
                  >
                    24h
                  </button>
                </div>

                {/* Regional Dropdown */}
                <div className="regional-dropdown-container">
                  <button
                    className="regional-dropdown-toggle"
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    aria-expanded={showRegionDropdown}
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
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                padding: "8px 12px",
                              }}
                            >
                              <span
                                style={{
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  paddingRight: "16px",
                                }}
                              >
                                {tz.label}
                              </span>
                              <span
                                style={{
                                  width: "80px",
                                  textAlign: "right",
                                  flexShrink: 0,
                                }}
                              >
                                {currentTimes[tz.value] || "--:--"}
                              </span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="world-clock-btn"
                  onClick={() => setShowWorldClock(true)}
                  aria-label="Open world clock"
                >
                  <FaClock />
                </button>
              </div>

              <h3>Select a Time Slot</h3>
              <p className="selected-date">{formatDateDisplay(selectedDate)}</p>

              <div className="current-time-display">
                <FaClock aria-hidden="true" />
                Current time in {selectedTimeZone.split("/")[1] || selectedTimeZone}: <strong>{currentTime}</strong>
              </div>

              <div className="time-slots-grid">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`time-slot-btn ${!slot.isAvailable ? "blocked" : ""}`}
                      disabled={!slot.isAvailable}
                      onClick={() => slot.isAvailable && handleTimeClick(slot.systemTime)}
                    >
                      {slot.displayTime}
                      {!slot.isAvailable && <span className="blocked-label">Booked</span>}
                    </button>
                  ))
                ) : (
                  <p>No available time slots for this date</p>
                )}
              </div>

              <button className="back-btn" onClick={() => setSelectedDate(null)}>
                Back to Calendar
              </button>
            </div>
          ) : (
            // Time Selected - Show confirmation for alternate slot
            <div className="alternate-time-selected">
              <div className="success-message">
                <h4>Alternate Time Selected!</h4>
                <p className="selected-slot">
                  {formatDateDisplay(selectedDate)}, {selectedTime} ({currentTimezoneLabel})
                </p>
                <p>This time has been set as your alternate option.</p>
              </div>

              <div className="form-buttons">
                <button
                  className="confirm-btn"
                  onClick={() => handleAlternateSlotSelect(selectedDate, selectedTime)}
                >
                  Confirm Alternate Slot
                </button>
                <button
                  className="back-btn"
                  onClick={() => setSelectedTime(null)}
                >
                  Choose Different Time
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render the selected slots section
  const renderSelectedSlots = () => {
    if (!selectedDate || !selectedTime) return null;

    return (
      <div className="selected-slots-section">
        <h4>Selected Time Slots</h4>

        {/* Primary Slot */}
        <div className="slot-item primary-slot">
          <div className="slot-info">
            <span className="slot-type">Primary:</span>
            <span className="slot-details">
              {formatDateDisplay(selectedDate)}, {selectedTime} ({currentTimezoneLabel})
            </span>
          </div>
          <button
            className="edit-slot-btn"
            onClick={() => {
              setSelectedDate(null);
              setSelectedTime(null);
            }}
          >
            <FaEdit /> Edit
          </button>
        </div>

        {/* Alternate Slot (if selected) */}
        {alternateSlot && (
          <div className="slot-item secondary-slot">
            <div className="slot-info">
              <span className="slot-type">Alternate:</span>
              <span className="slot-details">
                {safeFormatDateDisplay(alternateSlot.date)}
                {alternateSlot.time} ({alternateSlot.timeZoneLabel || alternateSlot.timeZone})
              </span>
            </div>
            <button
              className="edit-slot-btn"
              onClick={() => {
                setAlternateSlot(null);
                setShowAlternateModal(true);
              }}
            >
              <FaEdit /> Edit
            </button>
          </div>
        )}
      </div>
    );
  };

  // Safe date formatting function
  const safeFormatDateDisplay = (date) => {
    if (!date) return "Invalid Date";

    try {
      if (date instanceof Date) {
        return formatDateDisplay(date);
      } else if (typeof date === 'string' || typeof date === 'number') {
        const dateObj = new Date(date);
        return isNaN(dateObj.getTime()) ? "Invalid Date" : formatDateDisplay(dateObj);
      }
      return "Invalid Date";
    } catch (error) {
      console.error('Date formatting error:', error);
      return "Invalid Date";
    }
  };

  return (
    <div className="calendar-scheduler" onClick={(e) => e.stopPropagation()}>
      <WorldClock
        isOpen={showWorldClock}
        onClose={() => setShowWorldClock(false)}
        timeFormat={timeFormat}
        onTimeZoneSelect={handleTimeZoneSelect}
      />

      <div className="scheduler-header">
        <h2 className="text-3xl font-bold text-blue-600 mt-6">{title}</h2>
        <div className="header-divider"></div>
      </div>

      <div className="scheduler-container mb-8">
        <div className="scheduler-card">
          {!selectedDate ? (
            // Calendar View
            <div className="calendar-view">
              <div className="scheduler-icon" aria-hidden="true">
                <FaCalendarAlt />
              </div>
              <div className="calendar-header-fixed">
                <div className="calendar-header">
                  <button className="month-nav-btn" onClick={() => changeMonth(-1)} aria-label="Previous month">
                    <FaChevronLeft />
                  </button>
                  <h3>
                    {monthName} {currentYear}
                  </h3>
                  <button className="month-nav-btn" onClick={() => changeMonth(1)} aria-label="Next month">
                    <FaChevronRight />
                  </button>
                </div>
              </div>

              <div className="calendar-grid-container">
                <div className="day-names" role="row">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="day-name" role="columnheader">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="days-grid" role="grid">
                  {days.map((date, index) => (
                    <button
                      key={index}
                      className={`day-cell ${!date ? "empty" : ""} ${date && isDateDisabled(date) ? "disabled" : ""}`}
                      onClick={() => handleDateClick(date)}
                      disabled={!date || isDateDisabled(date)}
                      aria-label={date ? `Select ${formatDateDisplay(date)}` : undefined}
                      role="gridcell"
                    >
                      {date && (
                        <>
                          <div className="day-number">{date.getDate()}</div>
                          {unavailableDates.includes(date.toISOString().split("T")[0]) && (
                            <div className="booked-indicator">Booked</div>
                          )}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : !selectedTime ? (
            // Time Slot Selection
            <div className="time-slot-view">
              <div className="time-zone-selector">
                <FaGlobe className="time-zone-icon" aria-hidden="true" />

                {/* Time format toggle */}
                <div className="time-format-toggle">
                  <button
                    onClick={() => setTimeFormat("12h")}
                    className={timeFormat === "12h" ? "active" : ""}
                  >
                    12h
                  </button>
                  <button
                    onClick={() => setTimeFormat("24h")}
                    className={timeFormat === "24h" ? "active" : ""}
                  >
                    24h
                  </button>
                </div>

                {/* Regional Dropdown */}
                <div className="regional-dropdown-container">
                  <button
                    className="regional-dropdown-toggle"
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    aria-expanded={showRegionDropdown}
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
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: "100%",
                                padding: "8px 12px",
                              }}
                            >
                              {/* Left side: label */}
                              <span
                                style={{
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  paddingRight: "16px",
                                }}
                              >
                                {tz.label}
                              </span>

                              {/* Right side: fixed time column */}
                              <span
                                style={{
                                  width: "80px",
                                  textAlign: "right",
                                  flexShrink: 0,
                                }}
                              >
                                {currentTimes[tz.value] || "--:--"}
                              </span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="world-clock-btn"
                  onClick={() => setShowWorldClock(true)}
                  aria-label="Open world clock"
                >
                  <FaClock />
                </button>
              </div>

              <h3>Select a Time Slot</h3>
              <p className="selected-date">{formatDateDisplay(selectedDate)}</p>
              <div className="current-time-display">
                <FaClock aria-hidden="true" />
                Current time in {selectedTimeZone.split("/")[1] || selectedTimeZone}: <strong>{currentTime}</strong>
              </div>

              <div className="time-slots-grid" role="group" aria-label="Available time slots">
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      className={`time-slot-btn ${!slot.isAvailable ? "blocked" : ""}`}
                      disabled={!slot.isAvailable}
                      onClick={() => slot.isAvailable && handleTimeClick(slot.systemTime)}
                      aria-label={`${slot.displayTime} ${slot.isAvailable ? "available" : "booked"}`}
                    >
                      {slot.displayTime}
                      {!slot.isAvailable && <span className="blocked-label">Booked</span>}
                    </button>
                  ))
                ) : (
                  <p>No available time slots for this date</p>
                )}
              </div>

              <div className="time-slot-actions">
                <button className="back-btn" onClick={() => setSelectedDate(null)}>
                  Back to Calendar
                </button>
              </div>
            </div>
          ) : isSuccess ? (
            // Success Message
            <div className="success-message">
              <h3>Appointment Request Sent!</h3>
              <p>Your appointment request has been sent for:</p>
              <p className="confirmation-details">
                <strong>{formatDateDisplay(selectedDate)}</strong>
                {selectedTime && (
                  <>
                    , <strong>{convertTimeToTimezone(selectedTime, "GMT+05:00", selectedTimeZone)}</strong>
                  </>
                )}
                {selectedTimeZone && (
                  <>
                    , <strong>{selectedTimeZone}</strong>
                  </>
                )}
              </p>
              <p>{successMessage}</p>
              <div className="button-container">
                <button
                  className="primary-btn"
                  onClick={() => {
                    setSelectedDate(null)
                    setSelectedTime(null)
                    setIsSuccess(false)
                  }}
                >
                  Schedule Another Appointment
                </button>
              </div>
            </div>
          ) : (
            // Appointment Form
            <div className="appointment-form-container">
              <h3>
                {isAdminPanel && selectedEmployee
                  ? `Schedule an Interview with ${selectedEmployee.name}`
                  : "Confirm Schedule"}
              </h3>

              <p className="selected-slot">
                {formatDateDisplay(selectedDate)}
                {selectedTime &&
                  `, ${convertTimeToTimezone(selectedTime, "Asia/Karachi", selectedTimeZone)}`}
                {selectedTimeZone && ` (${currentTimezoneLabel})`}
              </p>

              {error && (
                <div className="error-notification" role="alert">
                  <FaExclamationTriangle aria-hidden="true" /> {error}
                </div>
              )}

              <div className="form-scroll-container">
                <form onSubmit={handleSubmit} className="appointment-form">
                  {/* Name */}
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={
                        isAdminPanel && selectedEmployee
                          ? selectedEmployee.name
                          : userDetails.name
                      }
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      maxLength={50}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      disabled={isAdminPanel}
                    />
                    {errors.name && (
                      <span id="name-error" className="error-text" role="alert">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={
                        isAdminPanel && selectedEmployee
                          ? selectedEmployee.email
                          : userDetails.email
                      }
                      onChange={handleInputChange}
                      required
                      aria-describedby={errors.email ? "email-error" : undefined}
                      disabled={isAdminPanel}
                    />
                    {errors.email && (
                      <span id="email-error" className="error-text" role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Only show other fields if NOT admin-panel */}
                  {!isAdminPanel && (
                    <>
                      <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={userDetails.phone}
                          onChange={handleInputChange}
                          required
                          aria-describedby={errors.phone ? "phone-error" : undefined}
                        />
                        {errors.phone && (
                          <span id="phone-error" className="error-text" role="alert">
                            {errors.phone}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="company">Company Name</label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={userDetails.company}
                          onChange={handleInputChange}
                          maxLength={50}
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="website">Company Website</label>
                        <input
                          type="url"
                          id="website"
                          name="website"
                          value={userDetails.website}
                          onChange={handleInputChange}
                          placeholder="https://example.com"
                          aria-describedby={errors.website ? "website-error" : undefined}
                        />
                        {errors.website && (
                          <span id="website-error" className="error-text" role="alert">
                            {errors.website}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="niche">Niche of Hiring *</label>
                        <select
                          id="niche"
                          name="niche"
                          value={userDetails.niche}
                          onChange={handleInputChange}
                          required
                          aria-describedby={errors.niche ? "niche-error" : undefined}
                        >
                          <option value="">Select a niche</option>
                          {niches.map((niche) => (
                            <option key={niche.id} value={niche.name}>
                              {niche.name}
                            </option>
                          ))}
                        </select>
                        {errors.niche && (
                          <span id="niche-error" className="error-text" role="alert">
                            {errors.niche}
                          </span>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="details">Additional Details</label>
                        <textarea
                          id="details"
                          name="details"
                          value={userDetails.details}
                          onChange={handleInputChange}
                          rows={4}
                          placeholder="Please share any specific requirements..."
                          maxLength={500}
                        />
                      </div>
                    </>
                  )}

                  {/* Selected slots display */}
                  {renderSelectedSlots()}

                  {/* Alternate option question - only show if no alternate slot selected yet */}
                  {isAdminPanel && !isAlternateScheduler && (
                    <div className="alternate-question">
                      <p>
                        Do you want to offer the candidate another date and time for interview too,
                        for his convenience?
                      </p>
                      <div className="yes-no-buttons">
                        <button
                          type="button"
                          className={`yes-btn ${offerAlternate === true ? "selected" : ""}`}
                          onClick={() => setShowAlternateModal(true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className={`no-btn ${offerAlternate === false ? "selected" : ""}`}
                          onClick={() => setOfferAlternate(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  )}
                  {showAlternateModal && (
                    <div className="alternate-modal-overlay">
                      <div className="alternate-modal">
                        <CalendarScheduler
                          isAlternateScheduler={true}
                          onAlternateSlotSelect={handleAlternateSlotSelect}
                          selectedEmployee={selectedEmployee}
                        />
                      </div>
                    </div>
                  )}
                  <div className="form-buttons">
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => setSelectedTime(null)}
                      disabled={isSubmitting}
                    >
                      Back to Time Slots
                    </button>
                    <button
                      type="submit"
                      className="confirm-btn"
                      disabled={isSubmitting || (offerAlternate === null && isAdminPanel)}
                    >
                      {submitButtonText}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alternate Scheduler Overlay */}
      {/* {renderAlternateScheduler()} */}

      <style jsx>{`
      .alternate-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .alternate-modal {
    background: white;
    border-radius: 12px;
    padding: 20px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .alternate-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
  }
  
  .alternate-modal-header h3 {
    margin: 0;
    color: #2a2d7c;
  }
  
  .close-modal-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: #666;
    padding: 5px;
  }
  
  .close-modal-btn:hover {
    color: #000;
  }
    
        .calendar-scheduler {
          max-width: 800px;
          margin: 0 auto;
          font-family: 'Arial', sans-serif;
          position: relative;
        }
        
        .alternate-scheduler-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .alternate-scheduler-modal {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
        }
        
        .alternate-scheduler-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .close-alternate-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #666;
        }
        
        .selected-slots-section {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #eee;
        }
        
        .selected-slots-section h4 {
          margin: 0 0 15px 0;
          color: #2a2d7c;
        }
        
        .slot-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: white;
          border-radius: 6px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
        }
        
        .slot-info {
          flex: 1;
        }
        
        .slot-type {
          font-weight: bold;
          color: #2a2d7c;
          margin-right: 8px;
        }
        
        .slot-details {
          color: #555;
        }
        
        .edit-slot-btn {
          background: #f0f8ff;
          border: 1px solid #06a3c2;
          color: #06a3c2;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
        }
        
        .edit-slot-btn:hover {
          background: #e1f5fe;
        }
        
        .alternate-question {
          margin: 20px 0;
          padding: 15px;
          background: #f0f8ff;
          border-radius: 8px;
          border-left: 4px solid #06a3c2;
        }
        
        .alternate-question p {
          margin: 0 0 15px 0;
          font-weight: 500;
          color: #2a2d7c;
        }
        
        .yes-no-buttons {
          display: flex;
          gap: 10px;
        }
        
        .yes-btn, .no-btn {
          padding: 10px 20px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }
        
        .yes-btn.selected, .no-btn.selected {
          border-color: #06a3c2;
          background: #06a3c2;
          color: white;
        }
        
        .yes-btn:hover, .no-btn:hover {
          border-color: #06a3c2;
        }
        
        /* Rest of the CSS remains the same as before */
        .scheduler-header {
          text-align: center;
          margin-bottom: 2rem;
          margin-top: 2rem;
        }
        
        .header-divider {
          width: 100px;
          height: 3px;
          background-color: #06a3c2;
          margin: 10px auto;
        }
        
        .scheduler-container {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        .scheduler-card {
          text-align: center;
        }
        
        .scheduler-icon {
          font-size: 2rem;
          color: #2A2D7C;
          margin-bottom: 1rem;
        }
        
        .calendar-view {
          max-width: 500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }
        
        .calendar-header-fixed {
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
          padding: 10px 0;
        }
        
        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
        }
        
        .calendar-header h3 {
          margin: 0;
          color: #2A2D7C;
          font-size: 1.2rem;
          white-space: nowrap;
        }
        
        .month-nav-btn {
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          color: #2A2D7C;
          padding: 0.5rem;
          border-radius: 4px;
          transition: all 0.2s;
        }
        
        .month-nav-btn:hover:not(:disabled) {
          color: #06a3c2;
          background-color: #f0f8ff;
        }
        
        .calendar-grid-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          width: 100%;
        }
        
        .day-names {
          display: grid;
          grid-template-columns: repeat(7, minmax(40px, 1fr));
          text-align: center;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #2A2D7C;
          position: sticky;
          left: 0;
          background: white;
          min-width: 280px;
        }
        
        .day-name {
          padding: 0.5rem;
        }
        
        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(40px, 1fr));
          gap: 5px;
          min-width: 280px;
        }
        
        .day-cell {
          min-height: 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          padding: 0.2rem;
          aspect-ratio: 1;
          background: none;
          border: 1px solid transparent;
        }
        
        .day-cell:not(.empty):not(.disabled):hover {
          background-color: #e1f5fe;
          border-color: #06a3c2;
        }
        
        .day-cell:not(.empty):not(.disabled):focus {
          outline: 2px solid #06a3c2;
          outline-offset: 2px;
        }
        
        .day-cell.empty {
          visibility: hidden;
        }
        
        .day-cell.disabled {
          color: #ccc;
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        .day-number {
          font-size: 0.9rem;
          font-weight: bold;
        }
        
        .booked-indicator {
          font-size: 0.6rem;
          color: #f44336;
          margin-top: 2px;
        }
        
        .time-slot-view {
          max-width: 500px;
          margin: 0 auto;
        }
        
        .time-slot-view h3 {
          color: #2A2D7C;
          margin-bottom: 0.5rem;
        }
        
        .selected-date {
          color: #2A2D7C;
          font-weight:  bold;
          margin-bottom: 1.5rem;
        }
        
        .current-time-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 1rem;
          margin-bottom: 16px;
          padding: 10px 14px;
          background-color: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          color: #333;
        }
        
        .current-time-display strong {
          color: #2A2D7C;
          font-weight: bold;
        }
        
        .time-slots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 10px;
          margin-bottom: 1.5rem;
        }
        
        .time-slot-btn {
          padding: 10px;
          background-color: #06a3c2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.9rem;
        }
        
        .time-slot-btn:hover:not(:disabled) {
          background-color: #2A2D7C;
          transform: translateY(-1px);
        }
        
        .time-slot-btn:focus {
          outline: 2px solid #06a3c2;
          outline-offset: 2px;
        }
        
        .time-slot-btn.blocked {
          background-color: #f8d7da;
          color: #721c24;
          cursor: not-allowed;
          position: relative;
        }
        
        .time-slot-btn.blocked:hover {
          background-color: #f8d7da;
          transform: none;
        }
        
        .blocked-label {
          display: block;
          font-size: 0.7em;
          color: #dc3545;
          margin-top: 4px;
        }
        
        .time-slot-actions {
          display: flex;
          justify-content: center;
        }
        
        .appointment-form-container {
          display: flex;
          flex-direction: column;
          max-height: 80vh;
        }
        
        .selected-slot {
          font-size: 1.1rem;
          color: #2A2D7C;
          margin-bottom: 1.5rem;
          text-align: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .form-scroll-container {
          flex-grow: 1;
          overflow-y: auto;
          padding-right: 8px;
          margin-bottom: 15px;
        }
        
        .form-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .form-scroll-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .form-scroll-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .form-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .form-group {
          margin-bottom: 1rem;
          text-align: left;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          color: #333;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #06a3c2;
          box-shadow: 0 0 0 2px rgba(6, 163, 194, 0.2);
        }
        
        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .error-text {
          color: #dc3545;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }
        
        .error-notification {
          background-color: #f8d7da;
          color: #721c24;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .form-buttons {
          display: flex;
          justify-content: center;
          margin-top: auto;
          padding-top: 15px;
          flex-shrink: 0;
          border-top: 1px solid #eee;
          gap: 1rem;
        }
        
        .confirm-btn,
        .back-btn,
        .primary-btn {
          padding: 12px 24px;
          background-color: #2A2D7C;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .confirm-btn:hover:not(:disabled),
        .back-btn:hover:not(:disabled),
        .primary-btn:hover:not(:disabled) {
          background-color: #1a1c52;
          transform: translateY(-1px);
        }
        
        .confirm-btn:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
          transform: none;
        }
        
        .success-message {
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }
        
        .success-message h3 {
          color: #2A2D7C;
          margin-bottom: 1rem;
        }
        
        .confirmation-details {
          font-size: 1.1rem;
          margin: 1.5rem 0;
          padding: 1rem;
          background-color: #f0f8ff;
          border-radius: 4px;
          border-left: 4px solid #06a3c2;
        }
        
        .button-container {
          margin-top: 1.5rem;
        }
        
        .time-zone-selector {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          background: #f5f5f5;
          padding: 10px 15px;
          border-radius: 6px;
          flex-wrap: wrap;
          position: relative;
        }
        
        .detected-location {
          font-size: 0.9rem;
          color: #2A2D7C;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 150px;
        }
        
        .regional-dropdown-container {
          position: relative;
          flex: 1;
        }
        
        .regional-dropdown-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        
        .regional-dropdown-toggle:hover {
          border-color: #06a3c2;
        }
        
        .regional-dropdown-toggle:focus {
          outline: none;
          border-color: #06a3c2;
          box-shadow: 0 0 0 2px rgba(6, 163, 194, 0.2);
        }
        
        .chevron {
          transition: transform 0.2s;
        }
        
        .chevron.rotate-180 {
          transform: rotate(180deg);
        }
        
        .regional-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 100;
          max-height: 300px;
          overflow-y: auto;
          margin-top: 4px;
        }
        
        .regional-group {
          border-bottom: 1px solid #eee;
        }
        
        .regional-group:last-child {
          border-bottom: none;
        }
        
        .regional-group-header {
          padding: 8px 12px;
          background-color: #f8f9fa;
          font-weight: 600;
          font-size: 0.875rem;
          color: #2A2D7C;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .regional-option {
          display: block;
          width: 100%;
          padding: 8px 12px;
          text-align: left;
          border: none;
          background: white;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s;
        }
        
        .regional-option:hover {
          background-color: #f0f8ff;
        }
        
        .regional-option.selected {
          background-color: #06a3c2;
          color: white;
        }
        
        .world-clock-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #2A2D7C;
          font-size: 18px;
          padding: 5px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        
        .world-clock-btn:hover {
          background-color: rgba(42, 45, 124, 0.1);
        }
        
        .time-zone-icon {
          color: #2A2D7C;
          font-size: 18px;
          flex-shrink: 0;
        }
        
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .time-format-toggle {
          display: inline-flex;
          background: #f3f4f6;
          border-radius: 9999px;
          padding: 4px;
          gap: 4px;
          margin-right: auto;
        }
        
        .time-format-toggle button {
          flex: 1;
          padding: 6px 14px;
          border: none;
          border-radius: 9999px;
          background: transparent;
          font-size: 14px;
          font-weight: 500;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .time-format-toggle button:hover {
          background: #e5e7eb;
        }
        
        .time-format-toggle button.active {
          background: #ffffff;
          color: #111827;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .scheduler-container {
            padding: 1rem;
          }
          
          .appointment-form-container {
            max-height: 70vh;
          }
          
          .form-buttons {
            flex-direction: column;
          }
          
          .confirm-btn, .back-btn {
            width: 100%;
          }
          
          .time-zone-selector {
            flex-direction: column;
            align-items: stretch;
          }
          
          .regional-dropdown-container {
            width: 100%;
          }
          
          .yes-no-buttons {
            flex-direction: column;
          }
          
          .slot-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .edit-slot-btn {
            align-self: flex-end;
          }
        }
          .alternate-scheduler-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .alternate-scheduler-modal {
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 400px;
      width: 90%;
    }
    
    .alternate-scheduler {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.alternate-scheduler-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.alternate-scheduler-header h3 {
  margin: 0;
  color: #2a2d7c;
}

.alternate-scheduler-content {
  padding: 20px;
}

.alternate-time-selected {
  text-align: center;
  padding: 20px;
}

.alternate-time-selected .success-message {
  margin-bottom: 20px;
}

.alternate-time-selected .form-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
}

/* Ensure time zone selector works in modal */
.alternate-scheduler .time-zone-selector {
  margin: 0 0 20px 0;
}

.alternate-scheduler .time-slots-grid {
  margin: 20px 0;
}

.alternate-time-selected {
  padding: 20px;
  text-align: center;
}

.secondary-slot {
  border-left: 4px solid #06a3c2;
  background: #f0f8ff;
}

.primary-slot {
  border-left: 4px solid #2A2D7C;
  background: #f8f9fa;
}

.slot-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.slot-info {
  flex: 1;
}

.slot-type {
  font-weight: bold;
  margin-right: 8px;
  color: #2A2D7C;
}

.slot-details {
  color: #555;
}

.edit-slot-btn {
  background: #f0f8ff;
  border: 1px solid #06a3c2;
  color: #06a3c2;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.edit-slot-btn:hover {
  background: #e1f5fe;
}
      `}
      </style>
    </div>
  )
}

export default CalendarScheduler