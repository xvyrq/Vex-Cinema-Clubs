"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface GroupSettingsProps {
  groupId: string
  settings: {
    announcementDay: string
    movieDuration: string
    currentPickerIndex: number
  }
  members: any[]
}

export function GroupSettings({ groupId, settings, members }: GroupSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [announcementDay, setAnnouncementDay] = useState(settings.announcementDay)
  const [movieDuration, setMovieDuration] = useState(settings.movieDuration)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          announcementDay,
          movieDuration,
        }),
      })

      if (response.ok) {
        setIsEditing(false)
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to update settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShuffleOrder = async () => {
    if (!confirm("Are you sure you want to shuffle the member order?")) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/groups/${groupId}/shuffle`, {
        method: "POST",
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error("Failed to shuffle order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Group Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <>
            <div>
              <p className="text-sm font-medium">Announcement Day</p>
              <p className="text-sm text-muted-foreground">{announcementDay}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Movie Duration</p>
              <p className="text-sm text-muted-foreground">
                {movieDuration === "WEEKLY" ? "1 week" : movieDuration === "BIWEEKLY" ? "2 weeks" : "1 month"}
              </p>
            </div>
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => setIsEditing(true)}
              >
                Edit Settings
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={handleShuffleOrder}
                disabled={isLoading}
              >
                Shuffle Member Order
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="announcementDay">Announcement Day</Label>
              <select
                id="announcementDay"
                className="w-full p-2 border rounded"
                value={announcementDay}
                onChange={(e) => setAnnouncementDay(e.target.value)}
              >
                <option value="MONDAY">Monday</option>
                <option value="TUESDAY">Tuesday</option>
                <option value="WEDNESDAY">Wednesday</option>
                <option value="THURSDAY">Thursday</option>
                <option value="FRIDAY">Friday</option>
                <option value="SATURDAY">Saturday</option>
                <option value="SUNDAY">Sunday</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="movieDuration">Movie Duration</Label>
              <select
                id="movieDuration"
                className="w-full p-2 border rounded"
                value={movieDuration}
                onChange={(e) => setMovieDuration(e.target.value)}
              >
                <option value="WEEKLY">1 Week</option>
                <option value="BIWEEKLY">2 Weeks</option>
                <option value="MONTHLY">1 Month</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setAnnouncementDay(settings.announcementDay)
                  setMovieDuration(settings.movieDuration)
                  setIsEditing(false)
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
