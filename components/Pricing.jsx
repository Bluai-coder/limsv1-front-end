"use client";
import React, { useState } from "react";

const plans = [
  {
    id: 1,
    value: "free", // ✅ DB ENUM
    label: "Basic", // ✅ UI
    price: 0,
    popular: false,
    features: [
      "1 Site",
      "Basic Features",
      "Limited Traffic",
      "Community Support",
    ],
  },
  {
    id: 2,
    value: "starter",
    label: "Starter",
    price: 999,
    popular: false,
    features: [
      "1 Site",
      "Landing Pages",
      "Moderate Traffic",
      "Email Support",
    ],
  },
  {
    id: 3,
    value: "standard",
    label: "Standard",
    price: 2799,
    popular: true,
    features: [
      "3 Sites",
      "All Landing Features",
      "Unlimited Traffic",
      "Chat + Email Support",
    ],
  },
  {
    id: 4,
    value: "professional",
    label: "Professional",
    price: 5999,
    popular: false,
    features: [
      "10 Sites",
      "Advanced Features",
      "Unlimited Traffic",
      "Priority Support",
    ],
  },
  {
    id: 5,
    value: "enterprise",
    label: "Enterprise",
    price: 23999,
    popular: false,
    features: [
      "Unlimited Sites",
      "All Features",
      "Dedicated Support",
      "Custom Integrations",
    ],
  },
];

export default function Pricing() {
  const [selected, setSelected] = useState("standard"); // ✅ default ENUM value

  const handleSelect = (plan) => {
    setSelected(plan.value);

    // 🔥 yahan API call kar sakta hai
    console.log("Selected Plan:", plan.value);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-800 mb-10">
        Choose your plan
      </h1>

      <div className="flex flex justify-center gap-6 w-full max-w-7xl">
        {plans.map((plan) => {
          const active = selected === plan.value;

          return (
            <div
              key={plan.id}
              onClick={() => handleSelect(plan)}
              className={`relative w-full sm:w-[300px] rounded-2xl p-6 bg-white cursor-pointer transition-all duration-300
              ${
                active
                  ? "border-2 border-[#1b4dff] shadow-xl scale-105"
                  : "border border-gray-200"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#1b4dff] text-white text-xs px-3 py-1 rounded-md font-semibold">
                  MOST POPULAR
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-sm font-semibold text-gray-500 tracking-wide">
                {plan.label}
              </h3>

              {/* Price */}
              <div className="mt-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{plan.price}
                </span>
                <span className="text-gray-500 text-sm"> / Month</span>
              </div>

              {/* Button */}
              <button
                className={`w-full py-2 rounded-full text-sm font-medium mb-5 transition
                ${
                  active
                    ? "bg-[#1b4dff] text-white"
                    : "border border-gray-300 text-gray-600"
                }`}
              >
                {active ? "Selected" : "Choose Plan"}
              </button>

              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((f, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 flex items-center gap-2"
                  >
                    <span className="text-[#1b4dff]">✔</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}