"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import { Heart, Users, UserPlus, Camera, Calendar, MapPin, Clock, X, CalendarDays, Phone, Download } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"

interface Guest {
  id: number
  name: string
  email: string
  phone: string
  association: string
  connection: string
  photo_url?: string
  date_of_birth?: string
  location?: string
  bio?: string
  voice_note_url?: string
  created_at: string
}

interface HeartPosition {
  id: number
  x: number
  y: number
  isDragging: boolean
}

interface Event {
  time: string
  title: string
  location?: string
  description?: string
  dressCode?: string
}

interface DaySchedule {
  date: string
  events: Event[]
}

interface Hotel {
  name: string
  phone: string
}

interface LocationSuggestion {
  display_name: string
  lat: string
  lon: string
}

interface RoomAssignment {
  id: number;
  name: string;
  date_of_birth: string;
  room_number: string;
  hotel_name: string;
  created_at: string;
}

interface VerifiedGuest {
  id: number;
  roomAssignment: RoomAssignment;
}

// Add new interface for popup notification
interface PopupNotification {
  guest: Guest | null
  show: boolean
}

export default function WeddingRegistry() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    association: "",
    connection: "",
    date_of_birth: "",
    location: "",
    photoStyle: "normal",
    bio: "",
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("register")
  const [guestList, setGuestList] = useState<Guest[]>([])
  const [hearts, setHearts] = useState<HeartPosition[]>([])
  const [selectedConnection, setSelectedConnection] = useState<{name: string, side: 'bride' | 'groom'} | null>(null)
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [locationInputValue, setLocationInputValue] = useState("")
  const [isGeneratingGhibli, setIsGeneratingGhibli] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{url: string, name: string} | null>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null)
  const micStreamRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const audioBuffersRef = useRef<Float32Array[]>([])
  const [verifiedGuests, setVerifiedGuests] = useState<VerifiedGuest[]>([])
  const [passcode, setPasscode] = useState("")
  const [popupNotification, setPopupNotification] = useState<PopupNotification>({ guest: null, show: false })
  const [expandedGuestId, setExpandedGuestId] = useState<number | null>(null)

  const schedule: DaySchedule[] = [
    {
      date: "May 16th - Friday",
      events: [
        { 
          time: "7:00 AM", 
          title: "Pandha Kaal Muhurtham",
          description: "A sacred ceremony where we seek blessings from the family deity to start the wedding with positive energy and divine guidance."
        },
        { 
          time: "7:30 - 9:30 AM", 
          title: "Breakfast at home",
          description: "Enjoy a comforting South Indian breakfast spread with fresh coffee before the day begins."
        },
        { 
          time: "8:30 AM", 
          title: "Ancestral Puja",
          description: "Immediately following the muhurtham, this ritual honors our forebears and welcomes their spiritual presence in the celebrations."
        },
        { 
          time: "12:00 PM", 
          title: "Welcoming the Groom's Family",
          description: "The groom's family arrives with warm smiles and joyful anticipation. Expect a lively meet and greet as both sides mingle and connect."
        },
        { 
          time: "12:00 - 2:00 PM", 
          title: "Lunch at home",
          description: "Gather around for a cozy lunch filled with traditional favorites, lots of laughter, and shared stories."
        },
        { 
          time: "1:00 PM", 
          title: "Hotel Check-in Begins",
          description: "Guests can check in to their hotels. Rest up or glam up, because the colors are about to pop!"
        },
        { 
          time: "4:00 PM Onwards", 
          title: "Mehendi Ceremony",
          description: "The Mehendi marks a time for art and connection. Henna artists will adorn the bride's hands and yours, too—while everyone gathers for joyful chats, photos, and light bites.",
          dressCode: "Festive Indian wear in bright or pastel colors"
        },
        { 
          time: "4:00 - 5:00 PM", 
          title: "Coffee & Snacks Break",
          description: "Sip, snack, and show off your mehendi! Guests can take a short break to change attire for the evening if they wish."
        },
        { 
          time: "7:00 PM", 
          title: "Sangeet Night",
          description: "It's showtime! The Sangeet is our chance to dance, sing, and celebrate the bride and groom through music and performances. Expect epic dance numbers, friendly family rivalries, games, and perhaps a few surprises!",
          location: "D'Wayferer Resort",
          dressCode: "Indian party wear—anything sparkly, fun, and comfortable"
        },
        { 
          time: "7:30 - 8:30 PM", 
          title: "Dinner",
          description: "A lavish spread awaits—refuel before the final dance floor push!"
        }
      ]
    },
    {
      date: "May 17th - Saturday",
      events: [
        { 
          time: "Morning", 
          title: "Breakfast at Leisure",
          description: "Served at the hotel—no rush, just relaxation and a hot cup of chai or coffee."
        },
        { 
          time: "Morning", 
          title: "Temple Visits (Optional)",
          description: "Two nearby temples offer a lovely cultural excursion for those feeling adventurous:\n• Bhavani Sangameshwarar Temple (~20 km | 30 mins drive)\n• Thindal Murugan Temple (~5 km | 15 mins drive)"
        },
        { 
          time: "12:00 - 1:30 PM", 
          title: "Lunch at Aalayamani Mandapam",
          description: "A hearty and delicious lunch will be served as everyone gathers for the grand evening ahead.",
          location: "Aalayamani Mandapam"
        },
        { 
          time: "4:00 - 5:00 PM", 
          title: "Pre-Reception Photo Shoot + Coffee Break",
          description: "Arrive at the venue early for casual mingling, coffee, and snacks before the grand welcome."
        },
        { 
          time: "5:30 PM", 
          title: "Baraat Procession",
          description: "Bring your energy and best moves! The baraat is where we welcome the groom with dhol, dancing, and a party in motion. Get ready to join the celebration!"
        },
        { 
          time: "6:30 - 9:30 PM", 
          title: "Wedding Reception",
          description: "Celebrate the soon-to-be-wed couple in style. A night of heartfelt moments, and shared joy under the stars."
        },
        { 
          time: "7:00 - 9:00 PM", 
          title: "Dinner",
          description: "An elegant feast featuring South and North Indian fusion fare."
        }
      ]
    },
    {
      date: "May 18th - Sunday",
      events: [
        { 
          time: "5:30 AM Onwards", 
          title: "Wedding Rituals Begin",
          description: "The sacred ceremonies begin with Kaasi Yathirai, Maalai Maatrudhal (Garland Exchange), and dressing the couple in their wedding attire."
        },
        { 
          time: "Morning", 
          title: "Core Wedding Rituals",
          description: "• Muhurtham – The astrologically chosen sacred time\n• Paani Grahanam – The groom takes the bride's hand\n• Saptapathi – The seven sacred steps\n• Maangalya Dhaanam – Tying the thaali"
        },
        { 
          time: "Morning", 
          title: "Fun & Games",
          description: "• Uppu Yaanai / Pappu Yaanai – A fun guessing game\n• Ring Finding Game – Who finds the ring first?\n• Cradle Ceremony & Coconut Toss"
        },
        { 
          time: "12:00 - 1:00 PM", 
          title: "Wedding Lunch",
          description: "Join us for one last celebratory meal, lovingly prepared and served with gratitude."
        },
        { 
          time: "1:30 PM", 
          title: "Wedding Events Conclude",
          description: "Time for farewells, hugs, blessings and the beginning of a beautiful new chapter for the couple."
        }
      ]
    }
  ]

  const hotels: Hotel[] = [
    { name: "Hotel D'wafer", phone: "9489026222" },
    { name: "Hotel Turmeric", phone: "9063770000" },
    { name: "Hotel Varshan", phone: "9842815005" },
    { name: "Hotel Deepa", phone: "9585803636" },
    { name: "MKR Homestay", phone: "6380700287" },
  ]

  useEffect(() => {
    // Initialize hearts with random positions
    const initialHearts = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      isDragging: false
    }))
    setHearts(initialHearts)
  }, [])

  // Debounce function for location search
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout
    return (...args: any[]) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Fetch location suggestions
  const fetchLocationSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([])
      return
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      )
      const data = await response.json()
      setLocationSuggestions(data)
    } catch (error) {
      console.error('Error fetching location suggestions:', error)
      setLocationSuggestions([])
    }
  }

  // Debounced version of fetchLocationSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchLocationSuggestions, 300),
    []
  )

  // Handle location input change
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocationInputValue(value)
    setFormData(prev => ({ ...prev, location: value }))
    debouncedFetchSuggestions(value)
    setShowSuggestions(true)
  }

  // Handle location suggestion selection
  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setLocationInputValue(suggestion.display_name)
    setFormData(prev => ({ ...prev, location: suggestion.display_name }))
    setLocationSuggestions([])
    setShowSuggestions(false)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    // Reset input value so the same file can be selected again
    e.target.value = ''
  }

  // Add a function to handle opening device camera directly
  const openCamera = () => {
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.setAttribute('capture', 'environment');
      // Reset input value before opening camera
      fileInput.value = '';
      fileInput.click();
    }
  }

  // Add a function to handle file selection
  const openFileSelector = () => {
    const fileInput = document.getElementById('photo') as HTMLInputElement;
    if (fileInput) {
      fileInput.removeAttribute('capture');
      // Reset input value before opening file selector
      fileInput.value = '';
      fileInput.click();
    }
  }

  const generateGhibliImage = async () => {
    if (!photoFile) return

    setIsGeneratingGhibli(true)
    try {
      const formData = new FormData()
      formData.append('image', photoFile)

      const response = await fetch('/api/image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to generate Ghibli-style image')
      }

      const data = await response.json()
      if (data.image) {
        setPhotoPreview(`data:image/jpeg;base64,${data.image}`)
        // Convert base64 to File object
        const response = await fetch(`data:image/jpeg;base64,${data.image}`)
        const blob = await response.blob()
        const ghibliFile = new File([blob], 'ghibli-image.jpg', { type: 'image/jpeg' })
        setPhotoFile(ghibliFile)
      }
    } catch (error) {
      console.error('Error generating Ghibli-style image:', error)
      toast.error('Failed to generate Ghibli-style image')
    } finally {
      setIsGeneratingGhibli(false)
    }
  }

  const fetchGuestList = async () => {
    try {
      const response = await fetch("/api/wedding-registry")
      if (response.ok) {
        const data = await response.json()
        setGuestList(data)
      }
    } catch (error) {
      console.error("Error fetching guest list:", error)
    }
  }

  // Replace the isIOS function with a more reliable check
  const isIOSUnsupported = () => {
    return typeof MediaRecorder === 'undefined' || 
      !MediaRecorder.isTypeSupported('audio/webm') && 
      !MediaRecorder.isTypeSupported('audio/mp4');
  }

  // Create a new function for recording audio on iOS
  const startIOSRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create source from the microphone stream
      const micSource = audioContext.createMediaStreamSource(stream);
      micStreamRef.current = micSource;
      
      // Create a processor node
      const processorNode = audioContext.createScriptProcessor(4096, 1, 1);
      processorNodeRef.current = processorNode;
      
      // Clear previous buffers
      audioBuffersRef.current = [];
      
      // Connect nodes
      micSource.connect(processorNode);
      processorNode.connect(audioContext.destination);
      
      // Process audio data
      processorNode.onaudioprocess = (e) => {
        const channel = e.inputBuffer.getChannelData(0);
        const buffer = new Float32Array(channel.length);
        buffer.set(channel);
        audioBuffersRef.current.push(buffer);
      };
      
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please make sure your browser has permission to use it.');
    }
  };
  
  // Create a function to stop iOS recording
  const stopIOSRecording = () => {
    if (!audioContextRef.current || !processorNodeRef.current || !micStreamRef.current) return;
    
    // Disconnect nodes
    processorNodeRef.current.disconnect();
    micStreamRef.current.disconnect();
    
    // Get track and stop it
    micStreamRef.current.mediaStream.getTracks().forEach(track => track.stop());
    
    // Convert Float32Array buffers to a single audio buffer
    const audioContext = audioContextRef.current;
    const buffers = audioBuffersRef.current;
    const length = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
    const audioBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    let offset = 0;
    buffers.forEach(buffer => {
      channelData.set(buffer, offset);
      offset += buffer.length;
    });
    
    // Convert the audio buffer to WAV
    const wavData = convertToWav(audioBuffer);
    const audioBlob = new Blob([wavData], { type: 'audio/wav' });
    
    setAudioBlob(audioBlob);
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    
    setIsRecording(false);
  };

  // Add a WAV converter function
  const convertToWav = (audioBuffer: AudioBuffer) => {
    const numChannels = 1;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const buffer = audioBuffer.getChannelData(0);
    const length = buffer.length;
    const size = length * blockAlign;
    
    const arrayBuffer = new ArrayBuffer(44 + size);
    const dataView = new DataView(arrayBuffer);
    
    // RIFF identifier
    writeString(dataView, 0, 'RIFF');
    // RIFF chunk length
    dataView.setUint32(4, 36 + size, true);
    // RIFF type
    writeString(dataView, 8, 'WAVE');
    // format chunk identifier
    writeString(dataView, 12, 'fmt ');
    // format chunk length
    dataView.setUint32(16, 16, true);
    // sample format (raw)
    dataView.setUint16(20, format, true);
    // channel count
    dataView.setUint16(22, numChannels, true);
    // sample rate
    dataView.setUint32(24, sampleRate, true);
    // byte rate (sample rate * block align)
    dataView.setUint32(28, sampleRate * blockAlign, true);
    // block align (channel count * bytes per sample)
    dataView.setUint16(32, blockAlign, true);
    // bits per sample
    dataView.setUint16(34, bitDepth, true);
    // data chunk identifier
    writeString(dataView, 36, 'data');
    // data chunk length
    dataView.setUint32(40, size, true);
    
    // Write audio data
    floatTo16BitPCM(dataView, 44, buffer);
    
    return arrayBuffer;
  };
  
  const writeString = (dataView: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      dataView.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  const floatTo16BitPCM = (dataView: DataView, offset: number, input: Float32Array) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      dataView.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  };

  // Update the startRecording function to handle both standard and iOS cases
  const startRecording = async () => {
    if (isIOSUnsupported()) {
      await startIOSRecording();
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      toast.error('Could not access microphone. Please make sure your browser has permission to use it.')
    }
  }

  // Update the stopRecording function to handle both standard and iOS cases
  const stopRecording = () => {
    if (isIOSUnsupported()) {
      stopIOSRecording();
      return;
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      if (photoFile) {
        formDataObj.append("photo", photoFile)
      }

      if (audioBlob) {
        // Add file extension based on MIME type
        const extension = audioBlob.type.includes('webm') ? '.webm' : '.mp4'
        formDataObj.append("voiceNote", new File([audioBlob], `voice_note${extension}`, { type: audioBlob.type }))
      }

      const response = await fetch("/api/wedding-registry", {
        method: "POST",
        body: formDataObj,
      })

      if (response.ok) {
        toast("Success!", {
          description: "You've been added to the wedding registry.",
        })
        setFormData({
          name: "",
          email: "",
          phone: "",
          association: "",
          connection: "",
          date_of_birth: "",
          location: "",
          photoStyle: "normal",
          bio: "",
        })
        setPhotoFile(null)
        setPhotoPreview(null)
        setAudioBlob(null)
        setAudioUrl(null)

        // Refresh guest list if on that tab
        if (activeTab === "guests") {
          fetchGuestList()
        }
      } else {
        const error = await response.json()
        toast.error("Error", {
          description: error.message || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      toast.error("Error", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch guest list when switching to guests tab
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    if (value === "guests") {
      fetchGuestList()
    }
  }

  const handleMouseDown = (id: number) => {
    setHearts(prev => prev.map(heart => 
      heart.id === id ? { ...heart, isDragging: true } : heart
    ))
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!hearts.some(heart => heart.isDragging)) return

    const container = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - container.left) / container.width) * 100
    const y = ((e.clientY - container.top) / container.height) * 100

    setHearts(prev => prev.map(heart => 
      heart.isDragging ? { ...heart, x, y } : heart
    ))
  }

  const handleMouseUp = () => {
    setHearts(prev => prev.map(heart => ({ ...heart, isDragging: false })))
  }

  const handleImageDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guest-photo-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("Failed to download image");
    }
  };

  const handlePasscodeSubmit = async () => {
    if (!selectedGuest) return;
    setLoading(true);
    try {
      const response = await fetch("/api/admin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date_of_birth: passcode,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        // Add to verified guests list
        setVerifiedGuests(prev => [...prev, { id: selectedGuest.id, roomAssignment: data }]);
        // Clear passcode
        setPasscode("");
      } else {
        const error = await response.json();
        toast.error(error.message || "No room assignment found");
      }
    } catch (error) {
      toast.error("Error verifying room assignment");
    } finally {
      setLoading(false);
    }
  };

  // Add function to handle popup notification
  const showPopupNotification = (guest: Guest) => {
    setPopupNotification({ guest, show: true })
    setTimeout(() => {
      setPopupNotification(prev => ({ ...prev, show: false }))
    }, 5000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-red-50 to-red-200 relative overflow-hidden">
      {/* Add Popup Notification */}
      {popupNotification.show && popupNotification.guest && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-4 animate-slide-down">
            <div className="flex items-center space-x-4">
              {popupNotification.guest.photo_url ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={popupNotification.guest.photo_url}
                    alt={`Photo of ${popupNotification.guest.name}`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-medium text-gray-500">{popupNotification.guest.name.charAt(0)}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate">{popupNotification.guest.name}</h4>
                <p className="text-sm text-gray-600 truncate">{popupNotification.guest.location || 'Location not provided'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movable Hearts Background */}
      <div 
        className="absolute inset-0 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {hearts.map((heart) => (
          <div
            key={heart.id}
            className="absolute cursor-move select-none"
            style={{
              left: `${heart.x}%`,
              top: `${heart.y}%`,
              transform: heart.isDragging ? 'scale(1.2)' : 'scale(1)',
              transition: 'transform 0.2s ease',
            }}
            onMouseDown={() => handleMouseDown(heart.id)}
          >
            <div className="text-red-200 opacity-30 text-2xl hover:opacity-50 transition-opacity">❤</div>
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-10">
          <div className="flex flex-col items-center">
            {/* Artistic frame */}
            <div className="relative w-full max-w-2xl mx-auto mb-8">
              {/* Decorative corners */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-red-400"></div>
              <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-red-400"></div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-red-400"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-red-400"></div>

              {/* Main content */}
              <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                {/* Names with decorative elements */}
                <div className="relative mb-6">
                  <div className="text-4xl md:text-5xl font-serif text-red-600 tracking-wider">
                    <div className="transform hover:translate-x-2 transition-transform">Harini</div>
                    <div className="text-2xl text-red-400 my-2">♥</div>
                    <div className="transform hover:-translate-x-2 transition-transform">Aditya</div>
                  </div>
                </div>

                {/* Wedding details in a grid */}
                <div className="grid grid-cols-2 gap-6 text-red-600">
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>May 18, 2025</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>06:00 AM</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Aalayamani Mahal, Erode</span>
                  </div>
                </div>

                {/* Decorative line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-300 to-transparent"></div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="flex justify-center space-x-4">
              <div className="w-3 h-3 rounded-full bg-red-300 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-3 h-3 rounded-full bg-red-300 animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="register" className="max-w-4xl mx-auto" onValueChange={handleTabChange}>
          <TabsList className="flex flex-wrap justify-center gap-2 mb-8 bg-transparent">
            <TabsTrigger 
              value="register" 
              className="flex-1 min-w-[120px] max-w-[200px] px-4 py-3 rounded-full text-sm md:text-base data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-200 hover:bg-red-50"
            >
              <UserPlus className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline">Register</span>
              <span className="sm:hidden">Reg</span>
            </TabsTrigger>
            <TabsTrigger 
              value="guests" 
              className="flex-1 min-w-[120px] max-w-[200px] px-4 py-3 rounded-full text-sm md:text-base data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-200 hover:bg-red-50"
            >
              <Users className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline">Guest List</span>
              <span className="sm:hidden">Guests</span>
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="flex-1 min-w-[120px] max-w-[200px] px-4 py-3 rounded-full text-sm md:text-base data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all duration-200 hover:bg-red-50"
            >
              <CalendarDays className="w-4 h-4 mr-2 inline-block" />
              <span className="hidden sm:inline">Events</span>
              <span className="sm:hidden">Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <Card className="border-0 shadow-lg">
              <CardHeader className="rounded-t-lg">
                <CardTitle className="text-2xl text-red-800">Guest Registration</CardTitle>
                <CardDescription className="text-red-700">Please fill out this form to add yourself to the wedding registry.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth</Label>
                      <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleInputChange}
                        required
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative" ref={locationInputRef}>
                        <Input
                          id="location"
                          name="location"
                          placeholder="Enter your location"
                          value={locationInputValue}
                          onChange={handleLocationChange}
                          required
                          className="bg-white"
                          onFocus={(e) => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const { latitude, longitude } = position.coords;
                                  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                                    .then(response => response.json())
                                    .then(data => {
                                      if (data.display_name) {
                                        setLocationInputValue(data.display_name);
                                        setFormData(prev => ({
                                          ...prev,
                                          location: data.display_name
                                        }));
                                      }
                                    })
                                    .catch(error => console.error('Error getting location:', error));
                                },
                                (error) => {
                                  console.error('Error getting location:', error);
                                }
                              );
                            }
                          }}
                        />
                        {showSuggestions && locationSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                            {locationSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm"
                                onClick={() => handleSuggestionSelect(suggestion)}
                              >
                                {suggestion.display_name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="association">Association</Label>
                      <Select
                        onValueChange={(value) => handleSelectChange("association", value)}
                        value={formData.association}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select bride or groom" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bride">Bride (Harini)</SelectItem>
                          <SelectItem value="groom">Groom (Aditya)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.association && (
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="connection">Connection Through</Label>
                        <Select
                          onValueChange={(value) => handleSelectChange("connection", value)}
                          value={formData.connection}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select your connection" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.association === "bride" ? (
                              <>
                                <SelectItem value="Kalyani">Kalyani</SelectItem>
                                <SelectItem value="Kalyan">Kalyan</SelectItem>
                                <SelectItem value="Anjan">Anjan</SelectItem>
                                <SelectItem value="Raji">Raji</SelectItem>
                                <SelectItem value="Harini">Harini (Direct)</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="Ramesh">Ramesh</SelectItem>
                                <SelectItem value="Sushma">Sushma</SelectItem>
                                <SelectItem value="Nirupama">Nirupama</SelectItem>
                                <SelectItem value="Abhijit">Abhijit</SelectItem>
                                <SelectItem value="Aditya">Aditya (Direct)</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <textarea
                        id="bio"
                        name="bio"
                        className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                        placeholder="Tell us a bit about yourself..."
                        value={formData.bio}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="voiceNote" className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Voice Message for the Couple (Optional)
                      </Label>
                      <div className="space-y-4">
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-center space-x-4">
                            <Button
                              type="button"
                              variant={isRecording ? "destructive" : "outline"}
                              onClick={isRecording ? stopRecording : startRecording}
                              className="flex-1"
                            >
                              {isRecording ? (
                                <>
                                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
                                  Recording...
                                </>
                              ) : (
                                <>
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                  </svg>
                                  Record Voice Message
                                </>
                              )}
                            </Button>
                          </div>
                          {audioUrl && (
                            <div className="flex items-center space-x-4">
                              <audio src={audioUrl} controls className="flex-1" />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setAudioUrl(null)
                                  setAudioBlob(null)
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="photo" className="flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Photo (Optional)
                      </Label>
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="mb-4">
                              <Label htmlFor="photoStyle" className="text-sm text-gray-600">Photo Style</Label>
                              <Select
                                onValueChange={(value) => setFormData(prev => ({ ...prev, photoStyle: value }))}
                                value={formData.photoStyle}
                              >
                                <SelectTrigger className="bg-white">
                                  <SelectValue placeholder="Select photo style" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="ghibli">Ghibli Style</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex space-x-2">
                              <Input
                                id="photo"
                                name="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="bg-white hidden"
                              />
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={openFileSelector}
                                className="flex-1"
                              >
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                Choose File
                              </Button>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={openCamera}
                                className="flex-1"
                              >
                                <Camera className="w-4 h-4 mr-2" />
                                Switch to Camera
                              </Button>
                            </div>
                          </div>
                          {photoPreview && (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-red-200">
                              <Image
                                src={photoPreview}
                                alt="Preview"
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                          )}
                        </div>
                        {photoPreview && (
                          <div className="flex items-center space-x-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="flex-1"
                              onClick={() => {
                                setPhotoFile(null)
                                setPhotoPreview(null)
                              }}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Remove Photo
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                    {loading ? "Submitting..." : "Register as Guest"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests">
            <Card className="border-0 shadow-lg">
              <CardHeader className="rounded-t-lg">
                <CardTitle className="text-2xl text-red-800">Guest List & Connections</CardTitle>
                <CardDescription className="text-red-700">
                  View all registered guests and their connections to the bride and groom.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4">Family Connections</h3>
                  <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto">
                    <div className="min-w-[800px]">
                      <div className="flex justify-center gap-40 mb-8">
                        {/* Bride Side */}
                        <div className="text-center">
                          <div 
                            className={`w-32 h-32 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center animate-float cursor-pointer transition-all duration-200 ${selectedConnection?.name === 'Harini' ? 'ring-4 ring-red-400' : ''}`}
                            onClick={() => setSelectedConnection(selectedConnection?.name === 'Harini' ? null : {name: 'Harini', side: 'bride'})}
                          >
                            <span className="text-2xl font-bold text-red-600">Harini</span>
                          </div>
                          <p className="font-semibold text-slate-800">Bride</p>

                          <div className="mt-8 grid grid-cols-5 gap-4">
                            {["Kalyani", "Kalyan", "Anjan", "Raji", "Harini"].map((name) => (
                              <div key={name} className="text-center">
                                <div 
                                  className={`w-16 h-16 mx-auto mb-2 rounded-full bg-red-50 flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer ${selectedConnection?.name === name ? 'ring-4 ring-red-400' : ''}`}
                                  onClick={() => setSelectedConnection(selectedConnection?.name === name ? null : {name, side: 'bride'})}
                                >
                                  <span className="text-sm font-medium text-red-600">{name}</span>
                                </div>
                                <p className="text-xs text-slate-600">
                                  {guestList.filter((g) => g.association === "bride" && g.connection === name).length}{" "}
                                  guests
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Groom Side */}
                        <div className="text-center">
                          <div 
                            className={`w-32 h-32 mx-auto mb-2 rounded-full bg-red-100 flex items-center justify-center animate-float-delayed cursor-pointer transition-all duration-200 ${selectedConnection?.name === 'Aditya' ? 'ring-4 ring-red-400' : ''}`}
                            onClick={() => setSelectedConnection(selectedConnection?.name === 'Aditya' ? null : {name: 'Aditya', side: 'groom'})}
                          >
                            <span className="text-2xl font-bold text-red-600">Aditya</span>
                          </div>
                          <p className="font-semibold text-slate-800">Groom</p>

                          <div className="mt-8 grid grid-cols-5 gap-4">
                            {["Ramesh", "Sushma", "Nirupama", "Abhijit", "Aditya"].map((name) => (
                              <div key={name} className="text-center">
                                <div 
                                  className={`w-16 h-16 mx-auto mb-2 rounded-full bg-red-50 flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer ${selectedConnection?.name === name ? 'ring-4 ring-red-400' : ''}`}
                                  onClick={() => setSelectedConnection(selectedConnection?.name === name ? null : {name, side: 'groom'})}
                                >
                                  <span className="text-sm font-medium text-red-600">{name}</span>
                                </div>
                                <p className="text-xs text-slate-600">
                                  {guestList.filter((g) => g.association === "groom" && g.connection === name).length}{" "}
                                  guests
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {selectedConnection 
                      ? `Guests Connected to ${selectedConnection.name} (${selectedConnection.side === 'bride' ? 'Bride' : 'Groom'}'s Side)`
                      : 'Registered Guests'}
                  </h3>
                  {guestList.length > 0 ? (
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {guestList
                        .filter(guest => 
                          !selectedConnection || 
                          (guest.association === selectedConnection.side && guest.connection === selectedConnection.name)
                        )
                        .map((guest, index) => (
                          <div 
                            key={index} 
                            className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                            onClick={() => {
                              showPopupNotification(guest)
                              setExpandedGuestId(expandedGuestId === guest.id ? null : guest.id)
                            }}
                          >
                            <div className="flex flex-col items-center text-center space-y-3">
                              {guest.photo_url ? (
                                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                                  <Image
                                    src={guest.photo_url}
                                    alt={`Photo of ${guest.name}`}
                                    fill
                                    style={{ objectFit: "cover" }}
                                  />
                                </div>
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-2xl font-medium text-gray-500">{guest.name.charAt(0)}</span>
                                </div>
                              )}
                              <h4 className="font-semibold text-lg">{guest.name}</h4>
                              {expandedGuestId === guest.id && (
                                <div 
                                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedGuest(guest)
                                  }}
                                >
                                  View Details
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No guests have registered yet.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card className="border-0 shadow-lg">
              <CardHeader className="rounded-t-lg">
                <CardTitle className="text-2xl text-red-800">Wedding Events</CardTitle>
                <CardDescription className="text-red-700">Join us in celebrating our special moments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Schedule Section */}
                  <div className="space-y-8">
                    <h2 className="text-2xl font-serif text-red-800 mb-6">Event Schedule</h2>
                    {schedule.map((day, dayIndex) => (
                      <div key={dayIndex} className="relative">
                        {/* Day Header */}
                        <div className="flex items-center mb-6">
                          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                            <Calendar className="w-6 h-6 text-red-600" />
                          </div>
                          <h3 className="text-xl font-serif text-red-800">{day.date}</h3>
                        </div>

                        {/* Timeline */}
                        <div className="relative pl-12">
                          {/* Vertical Line */}
                          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-red-200"></div>

                          {day.events.map((event, eventIndex) => (
                            <div key={eventIndex} className="relative mb-8 last:mb-0">
                              {/* Timeline Dot */}
                              <div className="absolute left-[-2.5rem] w-5 h-5 rounded-full bg-red-100 border-4 border-red-200"></div>

                              {/* Event Card */}
                              <div className="bg-white rounded-lg shadow-sm p-4 border border-red-100 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-start space-x-4">
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                                      <Clock className="w-5 h-5 text-red-600" />
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-red-600 mb-1">
                                      {event.time}
                                    </div>
                                    <h4 className="font-medium text-gray-900">{event.title}</h4>
                                    {event.description && (
                                      <p className="text-sm text-gray-600 mt-2 whitespace-pre-line">{event.description}</p>
                                    )}
                                    {event.location && (
                                      <div className="flex items-center text-sm text-gray-600 mt-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {event.location}
                                      </div>
                                    )}
                                    {event.dressCode && (
                                      <div className="flex items-center text-sm text-gray-600 mt-2">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        Dress Code: {event.dressCode}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hotels Section */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-serif text-red-800 mb-6">Accommodation</h2>
                    <Card className="border-red-200">
                      <CardHeader className="bg-red-50">
                        <CardTitle className="text-xl text-red-800">Stay at Hotel Contacts</CardTitle>
                        <CardDescription className="text-red-600">Book your stay at any of these hotels</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {hotels.map((hotel, index) => (
                            <div 
                              key={index} 
                              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                                  <span className="text-red-600 font-medium">{hotel.name.charAt(0)}</span>
                                </div>
                                <h3 className="font-medium text-gray-900">{hotel.name}</h3>
                              </div>
                              <a
                                href={`tel:${hotel.phone}`}
                                className="flex items-center text-red-600 hover:text-red-700 transition-colors"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                <span>{hotel.phone}</span>
                              </a>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Guest Details Modal */}
      <Dialog open={!!selectedGuest} onOpenChange={() => {
        setSelectedGuest(null);
        setPasscode(""); // Clear passcode when modal closes
      }}>
        <DialogContent className="w-[95%] max-w-[400px] mx-auto rounded-2xl p-4 sm:p-6">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl sm:text-2xl font-serif text-red-600">Guest Details</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Information about {selectedGuest?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col items-center space-y-3">
                {selectedGuest.photo_url ? (
                  <div 
                    className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage({url: selectedGuest.photo_url || '', name: selectedGuest.name})}
                  >
                    <Image
                      src={selectedGuest.photo_url}
                      alt={`Photo of ${selectedGuest.name}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-3xl sm:text-4xl font-medium text-gray-500">{selectedGuest.name.charAt(0)}</span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl sm:text-2xl font-semibold">{selectedGuest.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Registered on {new Date(selectedGuest.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                  <span className="text-sm sm:text-base text-gray-600">{selectedGuest.location || 'Location not provided'}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm sm:text-base font-medium">Connection:</span>
                  <span className="text-sm sm:text-base text-gray-600">
                    {selectedGuest.association === "bride" ? "Bride" : "Groom"} → {selectedGuest.connection}
                  </span>
                </div>
              </div>

              {selectedGuest.bio && (
                <div className="pt-3 border-t">
                  <h4 className="text-sm sm:text-base font-medium mb-2">About</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedGuest.bio}</p>
                </div>
              )}

              {!verifiedGuests.find(vg => vg.id === selectedGuest.id) && (
                <div className="p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200 mt-4 overflow-hidden">
                  <h4 className="font-semibold text-red-800 mb-2 text-center text-sm sm:text-base">Access Room Assignment</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="passcode" className="text-xs sm:text-sm text-gray-700">
                        Enter your date of birth to view room assignment
                      </Label>
                      <Input
                        id="passcode"
                        type="date"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="bg-white text-sm sm:text-base w-full max-w-xs mx-auto h-10 sm:h-11 px-3 py-2 box-border rounded-md mb-2 border border-red-100 focus:border-red-400 focus:ring-1 focus:ring-red-200 mr-2 sm:mr-0"
                        tabIndex={-1}
                      />
                    </div>
                    <Button
                      onClick={handlePasscodeSubmit}
                      className="w-full bg-red-600 hover:bg-red-700 text-sm sm:text-base h-10 sm:h-11 mt-1"
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify"}
                    </Button>
                  </div>
                </div>
              )}

              {verifiedGuests.find(vg => vg.id === selectedGuest.id) && (
                <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 mt-4">
                  <h4 className="font-semibold text-green-800 mb-2 text-center text-sm sm:text-base">Room Assignment</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Hotel:</span>
                      <span className="text-xs sm:text-sm font-medium text-green-800">
                        {verifiedGuests.find(vg => vg.id === selectedGuest.id)?.roomAssignment.hotel_name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-600">Room Number:</span>
                      <span className="text-xs sm:text-sm font-medium text-green-800">
                        {verifiedGuests.find(vg => vg.id === selectedGuest.id)?.roomAssignment.room_number}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="w-[90%] max-w-[350px] mx-auto rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-serif text-red-600">
                {selectedImage?.name}'s Photo
              </DialogTitle>
              {selectedImage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleImageDownload(selectedImage.url)}
                  className="hover:bg-red-50"
                >
                  <Download className="h-5 w-5 text-red-600" />
                </Button>
              )}
            </div>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full aspect-square">
              <Image
                src={selectedImage.url}
                alt={`Full size photo of ${selectedImage.name}`}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}

// Add this CSS animation to your global styles or tailwind config
const styles = `
@keyframes slide-down {
  0% {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.animate-slide-down {
  animation: slide-down 0.3s ease-out forwards;
}
`