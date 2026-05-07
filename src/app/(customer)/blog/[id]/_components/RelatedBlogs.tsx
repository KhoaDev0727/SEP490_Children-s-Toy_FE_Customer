import Link from "next/link";
import Image from "next/image";

interface RelatedBlog {
  id: number;
  image: string;
  title: string;
  date: string;
  alt: string;
}

interface RelatedBlogsProps {
  blogs: RelatedBlog[];
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "--";
  }
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export default function RelatedBlogs({ blogs }: RelatedBlogsProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="font-bold text-xl text-[#261812]">Related Blogs</h3>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.id}`}
            className="w-[280px] min-w-[280px] rounded-xl border border-[#f8ddd2] bg-white overflow-hidden"
          >
            <div className="relative aspect-[4/3]">
              <Image src={blog.image} alt={blog.alt} fill unoptimized className="object-cover" />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold text-[#261812] line-clamp-2">{blog.title}</p>
              <p className="text-xs text-[#8e7164] mt-1">{formatDate(blog.date)}</p>
            </div>
          </Link>
        ))}
        {blogs.length === 0 && <p className="text-sm text-[#8e7164]">No related blogs available.</p>}
      </div>
    </section>
  );
}
