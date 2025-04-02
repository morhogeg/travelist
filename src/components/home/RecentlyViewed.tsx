import React from "react";
import { motion } from "framer-motion";

const recentlyViewed = [
  {
    id: "1",
    name: "Paris Cafes",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "New York",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Tokyo",
    image: "https://images.unsplash.com/photo-1554797589-7241bb691973?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

const RecentlyViewed = () => {
  return (
    <section className="px-6 py-6">
      <h2 className="text-xl font-semibold mb-4">Recently Viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {recentlyViewed.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * index }}
            className="flex-shrink-0 w-32 relative scale-[0.85]"
          >
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img 
                src={item.image} 
                alt={item.name} 
                className="object-cover h-full w-full"
              />
            </div>
            <p className="text-sm font-medium mt-2 text-center">{item.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;