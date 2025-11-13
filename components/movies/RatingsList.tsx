import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Rating {
  id: string
  rating: number
  review: string | null
  user: {
    name: string | null
  }
  createdAt: Date
}

interface RatingsListProps {
  ratings: Rating[]
}

export function RatingsList({ ratings }: RatingsListProps) {
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push("★")
    }
    if (hasHalfStar) {
      stars.push("⯨")
    }
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push("☆")
    }

    return stars.join("")
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-8">
          <p className="text-muted-foreground">No ratings yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings & Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium">{rating.user.name || "Anonymous"}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg">{renderStars(rating.rating)}</span>
                <span className="text-sm text-muted-foreground">
                  {rating.rating.toFixed(1)}
                </span>
              </div>
            </div>
            {rating.review && (
              <p className="text-sm text-muted-foreground">{rating.review}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(rating.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
