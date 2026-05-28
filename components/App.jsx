import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar.jsx";
import { EnergyConsumption } from "./EnergyConsumption.jsx";
import { getReadings } from "../utils/reading";

export const App = () => {
  const [readings, setReadings] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getReadings()
      .then(setReadings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="background shadow-2 flex overflow-hidden">
      <aside className="p3 menuWidth overflow-auto">
        <Sidebar readings={readings} />
      </aside>
      <article className="bg-very-light-grey p3 flex-auto overflow-auto">
        <EnergyConsumption readings={readings} />
      </article>
    </div>
  );
};
