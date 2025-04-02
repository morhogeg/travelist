// FILE: src/components/place/HeaderImage.tsx

import React from "react";

interface HeaderImageProps {
  name: string;
  image?: string;
  type?: "city" | "country";
}

const HeaderImage: React.FC<HeaderImageProps> = ({ name, image }) => {
  const fallbackImage =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"; // 🌍 world-travel look

  return (
    <div className="relative h-48 sm:h-64 md:h-72 lg:h-80 w-full overflow-hidden">
      <img
        src={image || fallbackImage}
        alt={name}
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
    </div>
  );
};

export default HeaderImage;