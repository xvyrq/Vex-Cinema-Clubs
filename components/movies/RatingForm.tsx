"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"

interface RatingFormProps {
  movieId: string
  groupId: string
  existingRating?: {
    id: string
    rating: number
    review: string | null
  } | null
}

export function RatingForm({ movieId, groupId, existingRating }: RatingFormProps) {
  const router = useRouter()
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [review, setReview] = useState(existingRating?.review || "")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/groups/${groupId}/movies/${movieId}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          review: review.trim() || null,
        }),
      })

      if (response.ok) {
        router.refresh()
        alert("Rating submitted successfully!")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to submit rating")
      }
    } catch (error) {
      console.error("Rating submission error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingRating) return
    if (!confirm("Are you sure you want to delete your rating?")) return

    setIsSubmitting(true)

    try {
      const response = await fetch(
        `/api/groups/${groupId}/movies/${movieId}/rate?ratingId=${existingRating.id}`,
        {
          method: "DELETE",
        }
      )

      if (response.ok) {
        setRating(0)
        setReview("")
        router.refresh()
        alert("Rating deleted successfully!")
      } else {
        alert("Failed to delete rating")
      }
    } catch (error) {
      console.error("Rating deletion error:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = () => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      const fullStar = (hoveredRating || rating) >= i
      const halfStar = (hoveredRating || rating) === i - 0.5

      stars.push(
        <div key={i} className="relative inline-block">
          <button
            type="button"
            className="text-3xl focus:outline-none"
            onMouseEnter={() => setHoveredRating(i)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(i)}
          >
            {fullStar ? "★" : halfStar ? "⯨" : "☆"}
          </button>
          <button
            type="button"
            className="absolute left-0 top-0 w-1/2 h-full opacity-0"
            onClick={() => setRating(i - 0.5)}
            onMouseEnter={() => setHoveredRating(i - 0.5)}
            onMouseLeave={() => setHoveredRating(0)}
          />
        </div>
      )
    }
    return stars
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingRating ? "Your Rating" : "Rate This Movie"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Rating</Label>
          <div className="flex items-center gap-2 my-2">{renderStars()}</div>
          <p className="text-sm text-muted-foreground">
            {rating > 0 ? `${rating}/5.0` : "Click to rate"}
          </p>
        </div>

        <div>
          <Label htmlFor="review">Review (Optional)</Label>
          <textarea
            id="review"
            className="w-full mt-2 p-2 border rounded min-h-[100px]"
            placeholder="Share your thoughts about the movie..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Submitting..." : existingRating ? "Update Rating" : "Submit Rating"}
          </Button>
          {existingRating && (
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
