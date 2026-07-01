"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Building,
  Globe,
  CreditCard,
  Mail,
  Phone,
  User,
  Database,
  ArrowLeft,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  Zap,
  Briefcase,
  Server,
  MapPin,
  MapPinned,
  Search,
  LocateFixed,
} from "lucide-react";
import Link from "next/link";

const COUNTRY_MAP = {
  India: "India",
  "United States of America": "USA",
  "United States": "USA",
  "United Kingdom": "UK",
  Canada: "Canada",
  Australia: "Australia",
  Germany: "Germany",
  France: "France",
  Japan: "Japan",
};

export default function CreateTenantForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Address autocomplete state
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      subdomain: "",
      plan: "standard",
      schemaName: "",
      billingEmail: "",
      technicalContact: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "India",
      latitude: "",
      longitude: "",
    },
  });

  const watchedSubdomain = watch("subdomain");
  const watchedName = watch("name");
  const watchedLatitude = watch("latitude");
  const watchedLongitude = watch("longitude");

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ========================================================
  // Autocomplete search using Photon (primary) + Nominatim (fallback)
  // Both are 100% free, no API key needed
  // ========================================================
  const handleAddressInput = (e) => {
    const value = e.target.value;
    setAddressQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        // ✅ PRIMARY: Photon API by Komoot — designed for autocomplete, way more results
        const photonRes = await axios.get("https://photon.komoot.io/api/", {
          params: {
            q: value,
            limit: 7,
            lang: "en",
          },
        });

        let results = [];

        if (photonRes.data?.features?.length > 0) {
          results = photonRes.data.features.map((f) => {
            const p = f.properties;
            const [lon, lat] = f.geometry.coordinates;

            // Build a readable display name
            const parts = [
              p.name,
              p.street,
              p.city || p.town || p.village,
              p.state,
              p.country,
            ].filter(Boolean);
            const displayName = [...new Set(parts)].join(", ");

            return {
              displayName,
              title: p.name || p.street || p.city || p.town || "",
              subtitle: [p.city || p.town || p.village, p.state, p.country]
                .filter(Boolean)
                .join(", "),
              latitude: parseFloat(lat).toFixed(6),
              longitude: parseFloat(lon).toFixed(6),
              address: p.street || p.name || "",
              city: p.city || p.town || p.village || "",
              state: p.state || "",
              country: p.country || "",
            };
          });
        }

        // ✅ FALLBACK: If Photon gives < 2 results, also try Nominatim
        if (results.length < 2) {
          try {
            const nomRes = await axios.get(
              "https://nominatim.openstreetmap.org/search",
              {
                params: {
                  q: value,
                  format: "json",
                  limit: 5,
                  addressdetails: 1,
                },
              }
            );

            if (nomRes.data?.length > 0) {
              const nomResults = nomRes.data.map((item) => ({
                displayName: item.display_name,
                title:
                  item.address?.road ||
                  item.address?.city ||
                  item.address?.town ||
                  item.display_name.split(",")[0] ||
                  "",
                subtitle: item.display_name,
                latitude: parseFloat(item.lat).toFixed(6),
                longitude: parseFloat(item.lon).toFixed(6),
                address:
                  item.address?.road ||
                  item.address?.neighbourhood ||
                  item.address?.suburb ||
                  "",
                city:
                  item.address?.city ||
                  item.address?.town ||
                  item.address?.village ||
                  item.address?.county ||
                  "",
                state: item.address?.state || "",
                country: item.address?.country || "",
              }));

              // Merge, remove duplicates by lat+lon
              const existing = new Set(
                results.map((r) => `${r.latitude},${r.longitude}`)
              );
              nomResults.forEach((r) => {
                if (!existing.has(`${r.latitude},${r.longitude}`)) {
                  results.push(r);
                }
              });
            }
          } catch {
            // Nominatim fallback failed, ignore
          }
        }

        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (error) {
        console.error("Search error:", error);

        // If Photon fails entirely, try Nominatim alone
        try {
          const nomRes = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
              params: {
                q: value,
                format: "json",
                limit: 5,
                addressdetails: 1,
              },
            }
          );
          if (nomRes.data?.length > 0) {
            const results = nomRes.data.map((item) => ({
              displayName: item.display_name,
              title:
                item.address?.road ||
                item.address?.city ||
                item.display_name.split(",")[0] ||
                "",
              subtitle: item.display_name,
              latitude: parseFloat(item.lat).toFixed(6),
              longitude: parseFloat(item.lon).toFixed(6),
              address:
                item.address?.road ||
                item.address?.neighbourhood ||
                item.address?.suburb ||
                "",
              city:
                item.address?.city ||
                item.address?.town ||
                item.address?.village ||
                item.address?.county ||
                "",
              state: item.address?.state || "",
              country: item.address?.country || "",
            }));
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
          }
        } catch {
          setSuggestions([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  };

  // Handle suggestion selection → auto-fill all fields
  const handleSelectSuggestion = (suggestion) => {
    setAddressQuery(suggestion.displayName);
    setShowSuggestions(false);
    setSuggestions([]);

    setValue("address", suggestion.address || suggestion.displayName, {
      shouldDirty: true,
    });
    setValue("city", suggestion.city, { shouldDirty: true });
    setValue("state", suggestion.state, { shouldDirty: true });

    const countryValue = COUNTRY_MAP[suggestion.country] || "India";
    setValue("country", countryValue, { shouldDirty: true });

    setValue("latitude", suggestion.latitude, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue("longitude", suggestion.longitude, {
      shouldValidate: true,
      shouldDirty: true,
    });

    toast.success("Address selected — all fields auto-filled!", {
      icon: <MapPin className="w-4 h-4" />,
      duration: 2000,
    });
  };

  // 📍 Use My Location — Browser Geolocation API + Nominatim reverse
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setValue("latitude", latitude.toFixed(6), {
          shouldValidate: true,
          shouldDirty: true,
        });
        setValue("longitude", longitude.toFixed(6), {
          shouldValidate: true,
          shouldDirty: true,
        });

        // Reverse geocode using Photon
        try {
          const response = await axios.get(
            "https://photon.komoot.io/reverse",
            { params: { lat: latitude, lon: longitude, lang: "en" } }
          );

          if (response.data?.features?.length > 0) {
            const p = response.data.features[0].properties;
            const parts = [p.name, p.street, p.city || p.town || p.village, p.state, p.country].filter(Boolean);
            const displayName = [...new Set(parts)].join(", ");

            setAddressQuery(displayName);
            setValue("address", p.street || p.name || displayName, {
              shouldDirty: true,
            });
            setValue("city", p.city || p.town || p.village || "", {
              shouldDirty: true,
            });
            setValue("state", p.state || "", { shouldDirty: true });
            setValue("country", COUNTRY_MAP[p.country] || "India", {
              shouldDirty: true,
            });

            toast.success("Current location detected & address filled!", {
              icon: <LocateFixed className="w-4 h-4" />,
              duration: 3000,
            });
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          toast.warning("Got coordinates but could not fetch address details");
        } finally {
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location permission denied. Please allow location access."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An error occurred while getting location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Build OpenStreetMap embed URL for mini map
  const getMapEmbedUrl = () => {
    if (!watchedLatitude || !watchedLongitude) return null;
    const lat = parseFloat(watchedLatitude);
    const lon = parseFloat(watchedLongitude);
    const d = 0.005;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lon - d}%2C${lat - d}%2C${lon + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lon}`;
  };

  const mapUrl = getMapEmbedUrl();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      console.log("Submitting data:", data);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/tenants/add`,
        data
      );

      console.log("Success:", response.data);

      toast.success("Tenant created successfully", {
        icon: <CheckCircle className="w-4 h-4" />,
      });

      router.push("/admin/tenants");
    } catch (error) {
      console.error("Error:", error?.response?.data || error.message);

      toast.error(error?.response?.data?.message || "Failed to create tenant", {
        icon: <AlertCircle className="w-4 h-4" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      value: "free",
      label: "Free",
      price: "$0",
      features: ["1 User", "100 Tests/month", "Basic Support"],
      icon: Zap,
    },
    {
      value: "starter",
      label: "Starter",
      price: "$49",
      features: ["5 Users", "1000 Tests/month", "Email Support"],
      icon: Briefcase,
    },
    {
      value: "standard",
      label: "Standard",
      price: "$99",
      features: ["10 Users", "5000 Tests/month", "Priority Support"],
      icon: Shield,
    },
    {
      value: "professional",
      label: "Professional",
      price: "$199",
      features: ["25 Users", "20000 Tests/month", "24/7 Support"],
      icon: Server,
    },
    {
      value: "enterprise",
      label: "Enterprise",
      price: "Custom",
      features: ["Unlimited Users", "Unlimited Tests", "Dedicated Support"],
      icon: Building,
    },
  ];

  const selectedPlan = plans.find((p) => p.value === watch("plan"));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/tenants"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tenants
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Tenant
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Set up a new laboratory or tenant workspace
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Basic Information Section */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Building className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Basic Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Lab/Tenant Name *
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("name", {
                            required: "Tenant name is required",
                          })}
                          placeholder="e.g., Acme Diagnostics"
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                            errors.name
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subdomain *
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("subdomain", {
                            required: "Subdomain is required",
                          })}
                          placeholder="e.g., acme"
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                            errors.subdomain
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      </div>
                      {watchedSubdomain && (
                        <p className="mt-1 text-xs text-gray-500">
                          URL: https://{watchedSubdomain}.bluai.ai
                        </p>
                      )}
                      {errors.subdomain && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.subdomain.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Contact Information
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Billing Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="email"
                          {...register("billingEmail", {
                            required: "Billing email is required",
                          })}
                          placeholder="billing@example.com"
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
                            errors.billingEmail
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                        />
                      </div>
                      {errors.billingEmail && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.billingEmail.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Technical Contact
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("technicalContact")}
                          placeholder="tech@example.com"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("phone")}
                          placeholder="+1 234 567 8900"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Schema Name
                      </label>
                      <div className="relative">
                        <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          {...register("schemaName")}
                          placeholder="tenant_schema"
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Optional: Custom database schema name
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Address
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={geoLoading}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {geoLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LocateFixed className="w-4 h-4" />
                      )}
                      {geoLoading ? "Detecting..." : "Use My Location"}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Address Autocomplete Search */}
                    <div ref={dropdownRef} className="relative">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Search Address
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        {searchLoading && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                        )}
                        <input
                          type="text"
                          value={addressQuery}
                          onChange={handleAddressInput}
                          onFocus={() => {
                            if (suggestions.length > 0)
                              setShowSuggestions(true);
                          }}
                          placeholder="Start typing... e.g., Connaught Place, New Delhi"
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          autoComplete="off"
                        />
                      </div>

                      {/* Suggestions Dropdown */}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() =>
                                handleSelectSuggestion(suggestion)
                              }
                              className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-start gap-3"
                            >
                              <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {suggestion.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {suggestion.subtitle}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      <p className="mt-1 text-xs text-gray-500">
                        Type at least 3 characters or use &quot;Use My
                        Location&quot;
                      </p>
                    </div>

                    {/* City / State / Country */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          City
                        </label>
                        <input
                          {...register("city")}
                          placeholder="Auto-filled"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State
                        </label>
                        <input
                          {...register("state")}
                          placeholder="Auto-filled"
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Country
                        </label>
                        <select
                          {...register("country")}
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                        >
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                          <option value="UK">United Kingdom</option>
                          <option value="Canada">Canada</option>
                          <option value="Australia">Australia</option>
                          <option value="Germany">Germany</option>
                          <option value="France">France</option>
                          <option value="Japan">Japan</option>
                        </select>
                      </div>
                    </div>

                    {/* Latitude & Longitude */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Latitude
                        </label>
                        <div className="relative">
                          <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register("latitude")}
                            placeholder="From selected address"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 cursor-not-allowed text-gray-600 dark:text-gray-300"
                            readOnly
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Longitude
                        </label>
                        <div className="relative">
                          <MapPinned className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            {...register("longitude")}
                            placeholder="From selected address"
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 cursor-not-allowed text-gray-600 dark:text-gray-300"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mini Map Preview */}
                    {mapUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-md">
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Location Preview
                            </span>
                          </div>
                          <a
                            href={`https://www.google.com/maps?q=${watchedLatitude},${watchedLongitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline"
                          >
                            Open in Google Maps ↗
                          </a>
                        </div>
                        <iframe
                          title="Location Map"
                          width="100%"
                          height="200"
                          src={mapUrl}
                          style={{ border: 0 }}
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-5 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => router.push("/admin/tenants")}
                    className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? "Creating..." : "Create Tenant"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-6">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Select Plan
                  </h2>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {plans.map((plan) => (
                  <label
                    key={plan.value}
                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      watch("plan") === plan.value
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          watch("plan") === plan.value
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                        }`}
                      >
                        <plan.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {plan.label}
                        </p>
                        <p className="text-sm text-gray-500">{plan.price}</p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      value={plan.value}
                      {...register("plan")}
                      className="w-4 h-4 text-blue-600"
                    />
                  </label>
                ))}
              </div>

              {selectedPlan && (
                <div className="p-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Features included:
                  </p>
                  <ul className="space-y-2">
                    {selectedPlan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {watchedName && watchedSubdomain && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-2">Preview</p>
                <h3 className="text-xl font-bold mb-1">{watchedName}</h3>
                <p className="text-sm opacity-80">
                  {watchedSubdomain}.bluai.ai
                </p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs opacity-75">
                    Ready to create this tenant?
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>  
  );
}
































































































// ---------------------------------------------------------------------------------------------------------------------------------------


// // components/TenantWizard.jsx
// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   Building, Globe, CreditCard, Mail, Phone, User, Database,
//   ArrowLeft, ArrowRight, Save, X, CheckCircle, AlertCircle,
//   Loader2, Palette, Server, Users, HardDrive, Clock,
//   Shield, Zap, Briefcase, Crown, Star
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { api } from '@/lib/api';

// // Plan details
// const PLANS = {
//   free: {
//     name: 'Free',
//     price: '₹0',
//     icon: Zap,
//     users: 5,
//     storage: 10,
//     features: ['Basic Reports', 'In-App Notifications', 'Email Support'],
//     color: 'gray'
//   },
//   starter: {
//     name: 'Starter',
//     price: '₹4,999/mo',
//     icon: Briefcase,
//     users: 20,
//     storage: 50,
//     features: ['Basic Reports', 'In-App Notifications', 'Email Support', 'Priority Support'],
//     color: 'blue'
//   },
//   standard: {
//     name: 'Standard',
//     price: '₹9,999/mo',
//     icon: Shield,
//     users: 50,
//     storage: 100,
//     features: ['Advanced Reports', 'In-App Notifications', 'Priority Support', 'API Access'],
//     color: 'indigo'
//   },
//   professional: {
//     name: 'Professional',
//     price: '₹19,999/mo',
//     icon: Star,
//     users: 100,
//     storage: 250,
//     features: ['Custom Reports', 'Priority Support', 'API Access', 'White Label', 'Advanced Analytics'],
//     color: 'purple'
//   },
//   enterprise: {
//     name: 'Enterprise',
//     price: 'Custom',
//     icon: Crown,
//     users: 1000,
//     storage: 1000,
//     features: ['All Features', '24/7 Support', 'SSO', 'Audit Logs', 'Dedicated Account Manager'],
//     color: 'gold'
//   }
// };

// // Step components
// const Step1BusinessDetails = ({ data, onChange, errors }) => (
//   <div className="space-y-6">
//     <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
//       <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//         <Building className="w-5 h-5 text-blue-600" />
//         Business Details
//       </h3>
//       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//         Enter your laboratory or organization details
//       </p>
//     </div>
    
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Organization Name *
//         </label>
//         <div className="relative">
//           <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             name="name"
//             value={data.name}
//             onChange={onChange}
//             required
//             className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
//               errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//             }`}
//             placeholder="e.g., Acme Diagnostics"
//           />
//         </div>
//         {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Subdomain *
//         </label>
//         <div className="relative">
//           <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             name="subdomain"
//             value={data.subdomain}
//             onChange={onChange}
//             required
//             className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
//               errors.subdomain ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//             }`}
//             placeholder="e.g., acme"
//           />
//         </div>
//         {data.subdomain && (
//           <p className="mt-1 text-xs text-gray-500">
//             URL: https://{data.subdomain}.bluai.ai
//           </p>
//         )}
//         {errors.subdomain && <p className="mt-1 text-xs text-red-500">{errors.subdomain}</p>}
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Custom Domain (Optional)
//         </label>
//         <input
//           type="text"
//           name="custom_domain"
//           value={data.custom_domain}
//           onChange={onChange}
//           className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//           placeholder="e.g., lab.acme.com"
//         />
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Billing Email *
//         </label>
//         <div className="relative">
//           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="email"
//             name="billing_email"
//             value={data.billing_email}
//             onChange={onChange}
//             required
//             className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 ${
//               errors.billing_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
//             }`}
//             placeholder="billing@acme.com"
//           />
//         </div>
//         {errors.billing_email && <p className="mt-1 text-xs text-red-500">{errors.billing_email}</p>}
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Technical Contact (Optional)
//         </label>
//         <div className="relative">
//           <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="email"
//             name="technical_contact"
//             value={data.technical_contact}
//             onChange={onChange}
//             className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//             placeholder="tech@acme.com"
//           />
//         </div>
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Phone (Optional)
//         </label>
//         <div className="relative">
//           <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="tel"
//             name="phone"
//             value={data.phone}
//             onChange={onChange}
//             className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//             placeholder="+91 98765 43210"
//           />
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const Step2PlanBilling = ({ data, onChange, errors }) => (
//   <div className="space-y-6">
//     <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
//       <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//         <CreditCard className="w-5 h-5 text-blue-600" />
//         Select Plan & Billing
//       </h3>
//       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//         Choose the plan that best fits your needs
//       </p>
//     </div>
    
//     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//       {Object.entries(PLANS).map(([key, plan]) => {
//         const Icon = plan.icon;
//         const isSelected = data.plan === key;
//         const colorClasses = {
//           gray: 'border-gray-300 hover:border-gray-400',
//           blue: 'border-blue-300 hover:border-blue-400',
//           indigo: 'border-indigo-300 hover:border-indigo-400',
//           purple: 'border-purple-300 hover:border-purple-400',
//           gold: 'border-yellow-400 hover:border-yellow-500'
//         };
        
//         return (
//           <div
//             key={key}
//             onClick={() => onChange({ target: { name: 'plan', value: key } })}
//             className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
//               isSelected 
//                 ? `border-${plan.color}-500 bg-${plan.color}-50 dark:bg-${plan.color}-900/20` 
//                 : `${colorClasses[plan.color]} bg-white dark:bg-gray-800 hover:shadow-md`
//             }`}
//           >
//             <div className="flex items-center gap-3 mb-3">
//               <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
//                 isSelected ? `bg-${plan.color}-500 text-white` : 'bg-gray-100 dark:bg-gray-700'
//               }`}>
//                 <Icon className="w-5 h-5" />
//               </div>
//               <div>
//                 <h4 className="font-semibold text-gray-900 dark:text-white">{plan.name}</h4>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">{plan.price}</p>
//               </div>
//               {isSelected && (
//                 <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
//               )}
//             </div>
            
//             <div className="space-y-2">
//               <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
//                 <Users className="w-4 h-4" />
//                 <span>{plan.users} Users</span>
//               </div>
//               <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
//                 <HardDrive className="w-4 h-4" />
//                 <span>{plan.storage} GB Storage</span>
//               </div>
//               <ul className="mt-2 space-y-1">
//                 {plan.features.slice(0, 3).map((feature, idx) => (
//                   <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
//                     <CheckCircle className="w-3 h-3 text-green-500" />
//                     {feature}
//                   </li>
//                 ))}
//                 {plan.features.length > 3 && (
//                   <li className="text-xs text-blue-600 dark:text-blue-400">
//                     +{plan.features.length - 3} more features
//                   </li>
//                 )}
//               </ul>
//             </div>
//           </div>
//         );
//       })}
//     </div>
    
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Default Currency
//         </label>
//         <select
//           name="default_currency"
//           value={data.default_currency}
//           onChange={onChange}
//           className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//         >
//           <option value="INR">₹ INR</option>
//           <option value="USD">$ USD</option>
//           <option value="EUR">€ EUR</option>
//           <option value="GBP">£ GBP</option>
//         </select>
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Timezone
//         </label>
//         <select
//           name="timezone"
//           value={data.timezone}
//           onChange={onChange}
//           className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//         >
//           <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
//           <option value="Asia/Dubai">Asia/Dubai (GST)</option>
//           <option value="America/New_York">America/New_York (EST)</option>
//           <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
//           <option value="Europe/London">Europe/London (GMT)</option>
//         </select>
//       </div>
//     </div>
//   </div>
// );

// const Step3Branding = ({ data, onChange }) => (
//   <div className="space-y-6">
//     <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
//       <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//         <Palette className="w-5 h-5 text-blue-600" />
//         Branding & Customization
//       </h3>
//       <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//         Customize your tenant branding
//       </p>
//     </div>
    
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Primary Color
//         </label>
//         <div className="flex gap-3">
//           <input
//             type="color"
//             name="branding_primary_color"
//             value={data.branding.primary_color || '#1b4dff'}
//             onChange={(e) => onChange({
//               target: {
//                 name: 'branding',
//                 value: { ...data.branding, primary_color: e.target.value }
//               }
//             })}
//             className="w-12 h-10 border rounded cursor-pointer"
//           />
//           <input
//             type="text"
//             name="branding_primary_color_text"
//             value={data.branding.primary_color || '#1b4dff'}
//             onChange={(e) => onChange({
//               target: {
//                 name: 'branding',
//                 value: { ...data.branding, primary_color: e.target.value }
//               }
//             })}
//             className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//           />
//         </div>
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Logo URL (Optional)
//         </label>
//         <div className="relative">
//           <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔗</div>
//           <input
//             type="url"
//             name="branding_logo_url"
//             value={data.branding.logo_url || ''}
//             onChange={(e) => onChange({
//               target: {
//                 name: 'branding',
//                 value: { ...data.branding, logo_url: e.target.value }
//               }
//             })}
//             className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//             placeholder="https://example.com/logo.png"
//           />
//         </div>
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Company Tagline
//         </label>
//         <input
//           type="text"
//           name="branding_tagline"
//           value={data.branding.tagline || ''}
//           onChange={(e) => onChange({
//             target: {
//               name: 'branding',
//               value: { ...data.branding, tagline: e.target.value }
//             }
//           })}
//           className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//           placeholder="e.g., Precision in Every Result"
//         />
//       </div>
      
//       <div>
//         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//           Locale / Language
//         </label>
//         <select
//           name="default_locale"
//           value={data.default_locale}
//           onChange={onChange}
//           className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
//         >
//           <option value="en-IN">English (India)</option>
//           <option value="en-US">English (US)</option>
//           <option value="hi-IN">Hindi (India)</option>
//           <option value="pa-IN">Punjabi (India)</option>
//           <option value="en-GB">English (UK)</option>
//         </select>
//       </div>
//     </div>
    
//     <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
//       <p className="text-sm text-blue-800 dark:text-blue-300 flex items-center gap-2">
//         <AlertCircle className="w-4 h-4" />
//         💡 Tip: These branding settings will appear on all reports and communications
//       </p>
//     </div>
//   </div>
// );

// const Step4Review = ({ data, errors }) => {
//   const selectedPlan = PLANS[data.plan] || PLANS.standard;
//   const Icon = selectedPlan.icon;
  
//   return (
//     <div className="space-y-6">
//       <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
//         <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//           <CheckCircle className="w-5 h-5 text-blue-600" />
//           Review & Confirm
//         </h3>
//         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//           Please review all information before submitting
//         </p>
//       </div>
      
//       {/* Business Details Summary */}
//       <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4">
//         <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//           <Building className="w-4 h-4" />
//           Business Details
//         </h4>
//         <div className="grid grid-cols-2 gap-3 text-sm">
//           <div>
//             <span className="text-gray-500 dark:text-gray-400">Name:</span>
//             <span className="font-medium text-gray-900 dark:text-white ml-2">{data.name}</span>
//           </div>
//           <div>
//             <span className="text-gray-500 dark:text-gray-400">Subdomain:</span>
//             <span className="font-medium text-gray-900 dark:text-white ml-2">{data.subdomain}.bluai.ai</span>
//           </div>
//           {data.custom_domain && (
//             <div>
//               <span className="text-gray-500 dark:text-gray-400">Custom Domain:</span>
//               <span className="font-medium text-gray-900 dark:text-white ml-2">{data.custom_domain}</span>
//             </div>
//           )}
//           <div>
//             <span className="text-gray-500 dark:text-gray-400">Billing Email:</span>
//             <span className="font-medium text-gray-900 dark:text-white ml-2">{data.billing_email}</span>
//           </div>
//         </div>
//       </div>
      
//       {/* Plan Summary */}
//       <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4">
//         <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//           <CreditCard className="w-4 h-4" />
//           Plan Details
//         </h4>
//         <div className="flex items-center gap-4">
//           <div className={`w-12 h-12 rounded-lg bg-${selectedPlan.color}-100 dark:bg-${selectedPlan.color}-900/30 flex items-center justify-center`}>
//             <Icon className={`w-6 h-6 text-${selectedPlan.color}-600`} />
//           </div>
//           <div>
//             <div className="font-semibold text-gray-900 dark:text-white">{selectedPlan.name}</div>
//             <div className="text-sm text-gray-500 dark:text-gray-400">{selectedPlan.price}</div>
//           </div>
//           <div className="ml-auto text-right">
//             <div className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.users} Users</div>
//             <div className="text-sm text-gray-600 dark:text-gray-400">{selectedPlan.storage} GB Storage</div>
//           </div>
//         </div>
//       </div>
      
//       {/* Features Summary */}
//       <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-4">
//         <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
//           <Server className="w-4 h-4" />
//           Included Features
//         </h4>
//         <div className="flex flex-wrap gap-2">
//           {selectedPlan.features.map((feature, idx) => (
//             <span key={idx} className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs">
//               {feature}
//             </span>
//           ))}
//         </div>
//       </div>
      
//       {/* Errors Summary */}
//       {Object.keys(errors).length > 0 && (
//         <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
//           <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2 flex items-center gap-2">
//             <AlertCircle className="w-4 h-4" />
//             Please fix the following issues:
//           </h4>
//           <ul className="space-y-1">
//             {Object.entries(errors).map(([key, value]) => (
//               <li key={key} className="text-sm text-red-700 dark:text-red-400">• {value}</li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// // Main Wizard Component
// export default function TenantWizard({ onSuccess, initialData }) {
//   const router = useRouter();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});
  
//   const [formData, setFormData] = useState({
//     name: '',
//     subdomain: '',
//     custom_domain: '',
//     plan: 'standard',
//     status: 'active',
//     billing_email: '',
//     technical_contact: '',
//     default_currency: 'INR',
//     default_locale: 'en-IN',
//     timezone: 'Asia/Kolkata',
//     settings: {},
//     branding: {
//       primary_color: '#1b4dff',
//       logo_url: '',
//       tagline: ''
//     },
//     phone: ''
//   });

//   const totalSteps = 4;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'branding') {
//       setFormData({ ...formData, branding: value });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
    
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors({ ...errors, [name]: '' });
//     }
//   };

//   const validateStep = (step) => {
//     const newErrors = {};
    
//     if (step === 1) {
//       if (!formData.name?.trim()) newErrors.name = 'Organization name is required';
//       if (!formData.subdomain?.trim()) newErrors.subdomain = 'Subdomain is required';
//       if (!formData.billing_email?.trim()) newErrors.billing_email = 'Billing email is required';
//       else if (!/\S+@\S+\.\S+/.test(formData.billing_email)) {
//         newErrors.billing_email = 'Invalid email format';
//       }
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (validateStep(currentStep)) {
//       if (currentStep < totalSteps) {
//         setCurrentStep(currentStep + 1);
//       }
//     }
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validateStep(currentStep)) return;
    
//     setLoading(true);
//     try {
//       const response = await api.post('/api/tenants', formData);
      
//       if (response.data.success) {
//         toast.success('Tenant created successfully!', {
//           icon: <CheckCircle className="w-4 h-4" />
//         });
        
//         if (onSuccess) {
//           onSuccess(response.data.data);
//         }
        
//         router.push('/admin/tenants');
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || 'Failed to create tenant');
//       setErrors({ submit: error?.response?.data?.message || 'Failed to create tenant' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const stepTitles = ['Business Details', 'Plan & Billing', 'Branding', 'Review'];

//   return (
//     <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
//       {/* Progress Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
//         <div className="flex items-center gap-3 mb-4">
//           <Building className="w-8 h-8 text-white" />
//           <div>
//             <h2 className="text-2xl font-bold text-white">Create New Tenant</h2>
//             <p className="text-blue-100 text-sm">Set up a new laboratory or organization</p>
//           </div>
//         </div>
        
//         {/* Steps Progress Bar */}
//         <div className="flex items-center gap-2">
//           {Array.from({ length: totalSteps }).map((_, idx) => {
//             const step = idx + 1;
//             const isActive = step === currentStep;
//             const isCompleted = step < currentStep;
            
//             return (
//               <div key={idx} className="flex items-center flex-1">
//                 <div className={`flex items-center gap-2 ${isActive ? 'text-white' : 'text-blue-200'}`}>
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
//                     isCompleted ? 'bg-white text-blue-600' :
//                     isActive ? 'bg-white text-blue-600' : 'bg-blue-500/50 text-white'
//                   }`}>
//                     {isCompleted ? <CheckCircle className="w-4 h-4" /> : step}
//                   </div>
//                   <span className={`hidden sm:inline text-sm ${isActive ? 'font-semibold' : ''}`}>
//                     {stepTitles[idx]}
//                   </span>
//                 </div>
//                 {idx < totalSteps - 1 && (
//                   <div className={`flex-1 h-0.5 mx-2 ${
//                     isCompleted ? 'bg-white' : 'bg-blue-400/50'
//                   }`} />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
      
//       {/* Form Content */}
//       <div className="p-6">
//         {currentStep === 1 && (
//           <Step1BusinessDetails
//             data={formData}
//             onChange={handleChange}
//             errors={errors}
//           />
//         )}
        
//         {currentStep === 2 && (
//           <Step2PlanBilling
//             data={formData}
//             onChange={handleChange}
//             errors={errors}
//           />
//         )}
        
//         {currentStep === 3 && (
//           <Step3Branding
//             data={formData}
//             onChange={handleChange}
//           />
//         )}
        
//         {currentStep === 4 && (
//           <Step4Review
//             data={formData}
//             errors={errors}
//           />
//         )}
        
//         {/* Navigation Buttons */}
//         <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
//           <button
//             type="button"
//             onClick={handleBack}
//             disabled={currentStep === 1}
//             className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back
//           </button>
          
//           {currentStep < totalSteps ? (
//             <button
//               type="button"
//               onClick={handleNext}
//               className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2"
//             >
//               Next
//               <ArrowRight className="w-4 h-4" />
//             </button>
//           ) : (
//             <button
//               type="button"
//               onClick={handleSubmit}
//               disabled={loading}
//               className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
//             >
//               {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//               {loading ? 'Creating...' : 'Create Tenant'}
//             </button>
//           )}
//         </div>
        
//         {errors.submit && (
//           <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//             <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }