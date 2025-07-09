// components/ui/TutorCard.jsx (REVISED)
import Link from "next/link";

const TutorCard = ({ tutor }) => {
  // Calculate average rating, avoiding division by zero
  const averageRating =
    tutor.numRatings > 0
      ? (tutor.rating / tutor.numRatings).toFixed(1)
      : "No ratings yet";

  return (
    <div className="card bg-base-100 shadow-xl transition-transform hover:scale-105">
      <div className="card-body">
        {/* Use the 'name' field */}
        <h2 className="card-title">{tutor.name}</h2>

        {/* Use the 'bio' field */}
        <p className="text-gray-600 h-20 overflow-hidden text-ellipsis">
          {tutor.bio}
        </p>

        <div className="my-2">
          <h3 className="font-semibold">Teaches:</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {/* Use the 'classes' array */}
            {tutor.modules?.slice(0, 3).map((cls) => (
              <div key={cls} className="badge badge-outline">
                {cls}
              </div>
            ))}
            {tutor.classes?.length > 3 && (
              <div className="badge badge-outline">...</div>
            )}
          </div>
        </div>

        {/* Use 'rating' and 'numRatings' fields for the review display */}
        <div className="flex items-center gap-2">
          <div className="rating rating-sm">
            {/* This is a simple visual representation, not the actual average */}
            <input
              type="radio"
              name="rating-1"
              className="mask mask-star"
              disabled
              checked
            />
          </div>
          <span className="font-bold">{averageRating}</span>
          <span className="text-sm text-gray-500">
            ({tutor.numRatings} reviews)
          </span>
        </div>

        <div className="card-actions justify-end">
          {/* The link now points to the tutor's unique ID */}
          <Link href={`/modules/${tutor.id}`} className="btn btn-primary">
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TutorCard;
