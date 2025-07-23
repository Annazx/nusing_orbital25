import Link from "next/link";
import ChatButton from "./ChatButton"; // Import our new component

// This component is now a simple, efficient Server Component again.
// It has no hooks and no "use client". It just displays data.
const TutorCard = ({ tutor }) => {
  const averageRating =
    tutor.numRatings > 0
      ? (tutor.rating / tutor.numRatings).toFixed(1)
      : "No ratings";

  return (
    <div className="card bg-base-100 shadow-xl transition-transform hover:scale-105">
      <div className="card-body">
        <h2 className="card-title">{tutor.name}</h2>
        <p className="text-gray-600 h-20 overflow-hidden text-ellipsis">
          {tutor.bio}
        </p>

        <div className="my-2">
          <h3 className="font-semibold">Teaches:</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {tutor.modules?.slice(0, 3).map((cls) => (
              <div key={cls} className="badge badge-outline">{cls}</div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="rating rating-sm">
            <input type="radio" name={`rating-${tutor.id}`} className="mask mask-star" disabled checked />
          </div>
          <span className="font-bold">{averageRating}</span>
          <span className="text-sm text-gray-500">({tutor.numRatings} reviews)</span>
        </div>

        <div className="card-actions justify-end">
          <Link href={`/modules/${tutor.id}`} className="btn btn-outline">
            View Profile
          </Link>
          {/* We simply render our new button and pass it the info it needs. */}
          <ChatButton tutorId={tutor.id} tutorName={tutor.name} />
        </div>
      </div>
    </div>
  );
};

export default TutorCard;