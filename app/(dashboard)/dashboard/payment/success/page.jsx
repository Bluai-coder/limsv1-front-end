// "use client";

// import { useEffect, useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { CheckCircle, XCircle, Loader2 } from "lucide-react";
// import { api } from "@/lib/api";

// export default function PaymentSuccessPage() {
//   const searchParams = useSearchParams();
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [status, setStatus] = useState("processing");
//   const [message, setMessage] = useState("Capturing your PayPal payment...");

//   useEffect(() => {
//     const capturePayment = async () => {
//       try {
//         const orderId = searchParams.get("token");

//         if (!orderId) {
//           setStatus("error");
//           setMessage("Invalid PayPal Order ID.");
//           setLoading(false);
//           return;
//         }

//         console.log("PayPal Order:", orderId);

//         const response = await api.post("/invoices/paypal/confirm/", {
//           orderId,
//         });

//         console.log(response.data);

//         if (response.data.success) {
//           setStatus("success");
//           setMessage("Payment completed successfully.");

//           setTimeout(() => {
//             router.push("/dashboard");
//           }, 3000);
//         } else {
//           setStatus("error");
//           setMessage(response.data.error || "Payment capture failed.");
//         }
//       } catch (err) {
//         console.error(err);

//         setStatus("error");
//         setMessage(
//           err.response?.data?.message ||
//             err.message ||
//             "Unable to capture payment."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     capturePayment();
//   }, [router, searchParams]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="bg-white shadow-xl rounded-xl p-10 w-full max-w-md text-center">

//         {loading && (
//           <>
//             <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold">
//               Processing Payment
//             </h2>

//             <p className="text-gray-600 mt-2">
//               {message}
//             </p>
//           </>
//         )}

//         {!loading && status === "success" && (
//           <>
//             <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />

//             <h2 className="text-2xl font-bold text-green-700">
//               Payment Successful
//             </h2>

//             <p className="mt-3 text-gray-600">
//               {message}
//             </p>

//             <p className="mt-5 text-sm text-gray-500">
//               Redirecting...
//             </p>
//           </>
//         )}

//         {!loading && status === "error" && (
//           <>
//             <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />

//             <h2 className="text-2xl font-bold text-red-700">
//               Payment Failed
//             </h2>

//             <p className="mt-3 text-gray-600">
//               {message}
//             </p>

//             <button
//               onClick={() => router.push("/dashboard")}
//               className="mt-6 w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700"
//             >
//               Return
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState(
    "Capturing your PayPal payment..."
  );

  const [paypalData, setPaypalData] = useState(null);

  useEffect(() => {
    const capturePayment = async () => {
      try {
        const orderId = searchParams.get("token");

        if (!orderId) {
          setStatus("error");
          setMessage("Invalid PayPal Order ID.");
          setLoading(false);
          return;
        }

        console.log("PayPal Order ID:", orderId);

        const response = await api.post("/invoices/paypal/confirm", {
          orderId,
        });

        console.log("Backend Response:");
        console.log(response.data);

        if (!response.data.success) {
          throw new Error(response.data.message || "Payment failed");
        }

        // Save complete PayPal response
        setPaypalData(response.data.paypal);

        console.log("Full PayPal Response:");
        console.log(response.data.paypal);

        setStatus("success");
        setMessage("Payment completed successfully.");
      } catch (err) {
        console.error(err);

        setStatus("error");

        setMessage(
          err.response?.data?.message ||
            err.message ||
            "Unable to capture payment."
        );
      } finally {
        setLoading(false);
      }
    };

    capturePayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl p-8">

        {loading && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />

            <h2 className="text-2xl font-bold">
              Processing Payment
            </h2>

            <p className="text-gray-600 mt-3">
              {message}
            </p>
          </div>
        )}

        {!loading && status === "success" && (
          <>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />

              <h2 className="text-3xl font-bold text-green-700">
                Payment Successful
              </h2>

              <p className="mt-3 text-gray-600">
                {message}
              </p>
            </div>

            {paypalData && (
              <>
                {/* Quick Summary */}

                <div className="mt-8 border rounded-lg p-6 bg-gray-50">

                  <h3 className="text-xl font-bold mb-5">
                    Payment Summary
                  </h3>

                  <div className="grid grid-cols-2 gap-4">

                    <div>
                      <strong>Order ID</strong>
                      <p>{paypalData.id}</p>
                    </div>

                    <div>
                      <strong>Status</strong>
                      <p>{paypalData.status}</p>
                    </div>

                    <div>
                      <strong>Payer Name</strong>
                      <p>
                        {paypalData.payer?.name?.given_name}{" "}
                        {paypalData.payer?.name?.surname}
                      </p>
                    </div>

                    <div>
                      <strong>Email</strong>
                      <p>
                        {paypalData.payer?.email_address}
                      </p>
                    </div>

                    <div>
                      <strong>Payer ID</strong>
                      <p>
                        {paypalData.payer?.payer_id}
                      </p>
                    </div>

                    <div>
                      <strong>Country</strong>
                      <p>
                        {paypalData.payer?.address?.country_code}
                      </p>
                    </div>

                    <div>
                      <strong>Amount</strong>
                      <p>
                        {
                          paypalData.purchase_units?.[0]?.payments
                            ?.captures?.[0]?.amount?.value
                        }
                      </p>
                    </div>

                    <div>
                      <strong>Currency</strong>
                      <p>
                        {
                          paypalData.purchase_units?.[0]?.payments
                            ?.captures?.[0]?.amount
                            ?.currency_code
                        }
                      </p>
                    </div>

                    <div>
                      <strong>Capture ID</strong>
                      <p>
                        {
                          paypalData.purchase_units?.[0]?.payments
                            ?.captures?.[0]?.id
                        }
                      </p>
                    </div>

                    <div>
                      <strong>Create Time</strong>
                      <p>
                        {
                          paypalData.purchase_units?.[0]?.payments
                            ?.captures?.[0]?.create_time
                        }
                      </p>
                    </div>

                  </div>
                </div>

                {/* Complete JSON */}

                <div className="mt-8">

                  <h3 className="text-xl font-bold mb-3">
                    Complete PayPal Response
                  </h3>

                  <pre className="bg-black text-green-400 rounded-lg p-5 overflow-auto text-xs max-h-[600px]">
                    {JSON.stringify(paypalData, null, 2)}
                  </pre>

                </div>
              </>
            )}

            <div className="flex gap-4 mt-8">

              <button
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3"
                onClick={() => console.log(paypalData)}
              >
                Print Response
              </button>

              <button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg py-3"
                onClick={() => router.push("/dashboard")}
              >
                Go Dashboard
              </button>

            </div>
          </>
        )}

        {!loading && status === "error" && (
          <div className="text-center">

            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />

            <h2 className="text-3xl font-bold text-red-700">
              Payment Failed
            </h2>

            <p className="mt-3 text-gray-600">
              {message}
            </p>

            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg"
            >
              Return
            </button>

          </div>
        )}
      </div>
    </div>
  );
}
