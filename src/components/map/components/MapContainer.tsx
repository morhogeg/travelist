const MapContainer: React.FC<MapContainerProps> = ({ initializeMap, cleanupMap }) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) {
      console.log("❌ Map container ref is NULL");
      return;
    }
    console.log("✅ Map container ref mounted:", mapContainer.current);
    initializeMap(mapContainer.current);

    return () => {
      console.log("🧹 Cleaning up map instance");
      cleanupMap();
    };
  }, [initializeMap, cleanupMap]);

  // ✅ Log just before render
  console.log("📦 Ref at render:", mapContainer.current);

  return (
    <div className="relative w-full min-h-[70vh] h-[70vh] flex rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="flex-1" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10" />
      <div className="absolute bottom-0 right-0 p-2 text-xs text-white/70 bg-black/30 rounded-tl-md">
        ©️ Mapbox ©️ OpenStreetMap
      </div>
    </div>
  );
};