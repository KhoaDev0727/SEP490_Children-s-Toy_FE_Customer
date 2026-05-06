interface Comment {
  id: number;
  initials: string;
  name: string;
  timeAgo: string;
  body: string;
}

interface CommentSectionProps {
  comments: Comment[];
}

export default function CommentSection({ comments }: CommentSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-bold text-xl text-[#261812]">Comments ({comments.length})</h3>
      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              {comment.initials}
            </div>
            <div className="flex-1 rounded-xl border border-[#f8ddd2] bg-white p-3">
              <p className="text-sm font-semibold text-[#261812]">{comment.name}</p>
              <p className="text-xs text-[#8e7164] mt-0.5">{comment.timeAgo}</p>
              <p className="text-sm text-[#5a4136] mt-2">{comment.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
