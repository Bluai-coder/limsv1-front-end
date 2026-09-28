// src/hooks/useBluHealth.js
// ============================================================
// BluHealth 3rd-party integration hooks (React Query)
// Matches bluHealthApi3rdParty (3 endpoints)
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bluHealthApi3rdParty } from "@/lib/api";
import { toast } from "sonner";

// ============================================================
// 🔹 1. getPatientById(patientId)
//    GET /api/bluhealth/patientsById/:patientId
// ============================================================
export function useBluHealthPatient(patientId, options = {}) {
  return useQuery({
    queryKey: ["bluhealth", "patient", patientId],
    queryFn: () =>
      bluHealthApi3rdParty
        .getPatientById(patientId)
        .then((r) => r.data?.data?.patients),
    enabled: !!patientId,
    staleTime: 30_000,
    retry: 1,
    ...options,
  });
}

// On-demand version (for "Fetch" button — gives toast + cache seed)
export function useBluHealthPatientSearch() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (patientId) =>
      bluHealthApi3rdParty
        .getPatientById(patientId)
        .then((r) => r.data?.data?.patients),

    onSuccess: (patient, patientId) => {
      if (!patient) {
        toast.error("No patient found for this BluHealth ID");
        return;
      }
      qc.setQueryData(["bluhealth", "patient", patientId], patient);
      toast.success(
        `Loaded: ${patient.first_name ?? ""} ${patient.last_name ?? ""}`.trim()
      );
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          "Failed to fetch patient from BluHealth"
      );
    },
  });
}

// ============================================================
// 🔹 2. getHospitalsByLab(tenantId)
//    GET /api/bluhealth/labs/:tenantId/hospitals
// ============================================================
export function useBluHealthHospitals(tenantId, options = {}) {
  return useQuery({
    queryKey: ["bluhealth", "hospitals", tenantId],
    queryFn: () =>
      bluHealthApi3rdParty
        .getHospitalsByLab(tenantId)
        .then((r) => r.data?.data?.hospitals ?? []),
    enabled: !!tenantId,
    staleTime: 15_000,
    keepPreviousData: true,
    ...options,
  });
}

// ============================================================
// 🔹 3. getLabRecommendations(hospitalId, labId, params)
//    GET /api/bluhealth/lab-recommendations/hospital/:hospitalId/lab/:labId
// ============================================================
export function useBluHealthLabRecommendations(
  hospitalId,
  labId,
  params = {},
  options = {}
) {
  return useQuery({
    queryKey: [
      "bluhealth",
      "lab-recommendations",
      hospitalId,
      labId,
      params,
    ],
    queryFn: () =>
      bluHealthApi3rdParty
        .getLabRecommendations(hospitalId, labId, params)
        .then((r) => r.data?.data),
    enabled: !!hospitalId && !!labId,
    staleTime: 15_000,
    keepPreviousData: true,
    ...options,
  });
}