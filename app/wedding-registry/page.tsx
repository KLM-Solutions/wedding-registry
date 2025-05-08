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
  message: string
  photo_url?: string
  date_of_birth?: string
  location?: string
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

export default function WeddingRegistry() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    association: "",
    connection: "",
    message: "",
    date_of_birth: "",
    location: "",
    photoStyle: "normal",
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const locationInputRef = useRef<HTMLInputElement>(null)

  const schedule: DaySchedule[] = [
    {
      date: "May 16th",
      events: [
        { time: "6:00 AM - 9:00 AM", title: "Panthakal, Pooja and Breakfast" },
        { time: "1:00 PM - 2:00 PM", title: "Lunch" },
        { time: "4:00 PM - 5:00 PM", title: "Haldi" },
        { time: "5:00 PM - 6:00 PM", title: "Mehendi" },
        { time: "6:00 PM - 8:00 PM", title: "Sangeeth" },
        { time: "8:00 PM onwards", title: "Dinner" },
      ],
    },
    {
      date: "May 17th",
      events: [
        { time: "Morning", title: "Breakfast and Stay at Hotel" },
        { time: "Afternoon", title: "Lunch at Aalayamani" },
        { time: "5:00 PM", title: "Barat" },
        { time: "6:00 PM onwards", title: "Reception with Dinner and DJ" },
      ],
    },
    {
      date: "May 18th",
      events: [
        { time: "6:00 AM - 7:15 AM", title: "Muhurtham" },
        { time: "7:15 AM onwards", title: "Breakfast" },
        { time: "12:00 PM", title: "Lunch" },
      ],
    },
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create FormData object for file upload
      const formDataObj = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      // Add photo if selected
      if (photoFile) {
        formDataObj.append("photo", photoFile)
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
          message: "",
          date_of_birth: "",
          location: "",
          photoStyle: "normal",
        })
        setPhotoFile(null)
        setPhotoPreview(null)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-red-50 to-red-200 relative overflow-hidden">
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
                      <Label htmlFor="message">Message for the Couple (Optional)</Label>
                      <textarea
                        id="message"
                        name="message"
                        className="w-full min-h-[100px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
                        placeholder="Write a message for the couple..."
                        value={formData.message}
                        onChange={handleInputChange}
                      />
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
                            <Input
                              id="photo"
                              name="photo"
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="bg-white"
                            />
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
                            className="p-4 border rounded-lg bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
                            onClick={() => setSelectedGuest(guest)}
                          >
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start gap-4">
                                {guest.photo_url ? (
                                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                                    <Image
                                      src={guest.photo_url}
                                      alt={`Photo of ${guest.name}`}
                                      fill
                                      style={{ objectFit: "cover" }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl font-medium text-gray-500">{guest.name.charAt(0)}</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-lg truncate">{guest.name}</h4>
                                  <p className="text-sm text-gray-600 truncate">
                                    {guest.email}
                                  </p>
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        guest.association === "bride"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {guest.association === "bride" ? "Bride" : "Groom"}
                                    </span>
                                    <span className="text-gray-400">→</span>
                                    <span className="text-sm text-gray-700 truncate">{guest.connection}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div className="flex items-center text-sm text-gray-600">
                                  <Phone className="w-4 h-4 mr-2" />
                                  <span className="truncate">{guest.phone}</span>
                                </div>
                                <p className="text-xs text-gray-500">{new Date(guest.created_at).toLocaleDateString()}</p>
                              </div>

                              {guest.message && (
                                <div className="pt-3 border-t">
                                  <p className="text-sm italic text-gray-600 line-clamp-2">"{guest.message}"</p>
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
                                    {event.location && (
                                      <div className="flex items-center text-sm text-gray-600 mt-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {event.location}
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
      <Dialog open={!!selectedGuest} onOpenChange={() => setSelectedGuest(null)}>
        <DialogContent className="w-[90%] max-w-[350px] mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-red-600">Guest Details</DialogTitle>
            <DialogDescription>
              Information about {selectedGuest?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedGuest && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {selectedGuest.photo_url ? (
                  <div 
                    className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer"
                    onClick={() => setSelectedImage(selectedGuest.photo_url || null)}
                  >
                    <Image
                      src={selectedGuest.photo_url}
                      alt={`Photo of ${selectedGuest.name}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl font-medium text-gray-500">{selectedGuest.name.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{selectedGuest.name}</h3>
                  <p className="text-sm text-gray-600">Registered on {new Date(selectedGuest.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Email:</span>
                  <span className="text-gray-600 text-sm">{selectedGuest.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Phone:</span>
                  <span className="text-gray-600 text-sm">{selectedGuest.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Connection:</span>
                  <span className="text-gray-600 text-sm">
                    {selectedGuest.association === "bride" ? "Bride" : "Groom"} → {selectedGuest.connection}
                  </span>
                </div>
              </div>

              {selectedGuest.message && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Message for the Couple:</h4>
                  <p className="text-sm italic text-gray-600">"{selectedGuest.message}"</p>
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
              <DialogTitle className="text-2xl font-serif text-red-600">Full Image</DialogTitle>
              {selectedImage && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleImageDownload(selectedImage)}
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
                src={selectedImage}
                alt="Full size image"
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