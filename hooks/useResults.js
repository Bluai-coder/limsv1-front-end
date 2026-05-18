import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";



export const useResults = () => {
  return useQuery({
    queryKey: ["results"],
    queryFn: () =>
      api.get("/results/all-results").then((res) => res.data.data),
  });
};