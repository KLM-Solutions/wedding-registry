"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Calendar, Clock, MapPin, Phone } from "lucide-react"

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

export default function Events() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-red-50 to-red-200 py-8">
      <div className="container mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-serif text-red-800 mb-4">Wedding Events</h1>
          <p className="text-red-600">Join us in celebrating our special moments</p>
        </header>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Schedule Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-red-800 mb-6">Event Schedule</h2>
            {schedule.map((day, index) => (
              <Card key={index} className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-xl text-red-800">{day.date}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-24">
                          <div className="flex items-center text-red-600">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">{event.time}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{event.title}</h3>
                          {event.location && (
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                      <div>
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
      </div>
    </div>
  )
} 