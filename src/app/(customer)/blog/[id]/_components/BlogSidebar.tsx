import Link from "next/link";
import Image from "next/image";

interface FeaturedBlog {
  id: number;
  title: string;
  date: string;
  image: string;
}

interface NewBlog {
  id: number;
  title: string;
  date: string;
  image: string;
  description: string;
}

interface BlogSidebarProps {
  featuredBlogs: FeaturedBlog[];
  newBlogs: NewBlog[];
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

export default function BlogSidebar({ featuredBlogs, newBlogs }: BlogSidebarProps) {
  return (
    <div className="flex flex-col gap-6 lg:sticky lg:top-24">
      <div className="bg-white rounded-2xl border border-[#f8ddd2] p-5 shadow-sm">
        <h3 className="font-bold text-sm text-[#261812] mb-4">Featured Blogs</h3>
        <div className="flex flex-col gap-4">
          {featuredBlogs.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`} className="flex gap-3 group items-start">
              <div className="relative w-24 min-w-24 aspect-[4/3] rounded-lg overflow-hidden bg-transparent">
                <Image src={post.image} alt={post.title} fill unoptimized className="object-contain p-1" />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-semibold text-[#261812] group-hover:text-[#ff6a00] transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h4>
                <span className="text-xs text-[#8e7164] mt-1 block">{formatDate(post.date)}</span>
              </div>
            </Link>
          ))}
          {featuredBlogs.length === 0 && (
            <p className="text-xs text-[#8e7164]">No featured blogs available.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#f8ddd2] p-5 shadow-sm">
        <h3 className="font-bold text-sm text-[#261812] mb-4">New Blogs</h3>
        <div className="flex flex-col gap-4">
          {newBlogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.id}`} className="flex gap-3 group items-start">
              <div className="relative w-24 min-w-24 aspect-[4/3] rounded-lg overflow-hidden bg-transparent">
                <Image src={blog.image} alt={blog.title} fill unoptimized className="object-contain p-1" />
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="text-sm font-semibold text-[#261812] group-hover:text-[#ff6a00] transition-colors line-clamp-2 leading-snug">
                  {blog.title}
                </h4>
                <p className="mt-1 text-xs text-[#8e7164] line-clamp-2">
                  {blog.description}
                </p>
                <span className="text-xs text-[#8e7164] mt-1 block">{formatDate(blog.date)}</span>
              </div>
            </Link>
          ))}
          {newBlogs.length === 0 && (
            <p className="text-xs text-[#8e7164]">No new blogs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
