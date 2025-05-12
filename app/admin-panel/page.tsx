"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

interface RoomAssignment {
  id: number
  name: string
  date_of_birth: string
  room_number: string
  hotel_name: string
  created_at: string
}

export default function AdminPanel() {
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
    roomNumber: "",
    hotelName: "",
  })
  const [loading, setLoading] = useState(false)
  const [assignments, setAssignments] = useState<RoomAssignment[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      const response = await fetch("/api/admin", {
        method: "POST",
        body: formDataObj,
      })

      if (response.ok) {
        toast.success("Room assignment added successfully!")
        setFormData({
          name: "",
          dateOfBirth: "",
          roomNumber: "",
          hotelName: "",
        })
        // Refresh the assignments list
        fetchAssignments()
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

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/admin")
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    }
  }

  // Fetch assignments on component mount
  useEffect(() => {
    fetchAssignments()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-red-50 to-red-200 p-8">
      <div className="container mx-auto max-w-4xl">
        <Card className="border-0 shadow-lg">
          <CardHeader className="rounded-t-lg">
            <CardTitle className="text-2xl text-red-800">Room Assignment Admin Panel</CardTitle>
            <CardDescription className="text-red-700">
              Manage room assignments for wedding guests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Guest Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter guest name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    placeholder="Select date of birth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotelName">Hotel Name</Label>
                  <Input
                    id="hotelName"
                    name="hotelName"
                    placeholder="Enter hotel name"
                    value={formData.hotelName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    name="roomNumber"
                    placeholder="Enter room number"
                    value={formData.roomNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading}>
                {loading ? "Adding..." : "Add Room Assignment"}
              </Button>
            </form>

            {/* Room Assignments List */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Current Room Assignments</h3>
              {assignments.length > 0 ? (
                <div className="grid gap-4">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-4 bg-white rounded-lg shadow-sm border border-red-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{assignment.name}</h4>
                          <p className="text-sm text-gray-600">
                            DOB: {new Date(assignment.date_of_birth).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                              {assignment.hotel_name}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 ml-2">
                              Room {assignment.room_number}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">No room assignments yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
} 