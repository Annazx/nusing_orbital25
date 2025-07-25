import React from "react";
import Link from "next/link";
import ChatButton from "./ChatButton"; 
import { Icon } from "@iconify/react";
import { Card, CardHeader, CardBody,  Chip, Button } from "@heroui/react";

const TutorCard = ({ tutor }) => {
  const averageRating =
    tutor.numRatings > 0
      ? (tutor.rating / tutor.numRatings).toFixed(1)
      : "No ratings";

  const starRating = tutor.numRatings > 0
    ? Math.round((tutor.rating / tutor.numRatings) * 2) / 2
    : 0;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex gap-4">
        <div className="flex flex-col">
          <p className="card-title">{tutor.name}</p>
          <p className="text-small text-default-500 line-clamp-2"> {tutor.bio}</p>
        </div>
      </CardHeader>
      <CardBody>
        <div className="mb-4">
          <p className="text-small font-semibold mb-2">Teaches:</p>
          <div className="flex flex-wrap gap-2">
            {tutor.modules?.slice(0, 3).map((cls) => (
              <Chip key={cls} className="badge badge-outline">{cls}</Chip>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
            <Icon
              key={star}
              icon={star <= starRating ? "lucide:star-full" : "lucide:star"}
              className={star <= starRating ? "text-warning" : "text-default-300"}
              width={20}
              height={20}
            />
          ))}
          <span className="font-bold">{averageRating}</span>
          <span className="text-sm text-default-500">({tutor.numRatings} reviews)</span>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            as={Link}
            href={`/modules/${tutor.id}`} 
            variant = "flat"
            color = "primary">
            View Profile
          </Button>
          <ChatButton tutorId={tutor.id} tutorName={tutor.name} />
        </div>
      </CardBody>
    </Card>
  );
}
export default TutorCard;