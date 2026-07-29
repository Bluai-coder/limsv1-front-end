// "use client";

// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import Script from "next/script";
// import Image from "next/image";
// import { QRCodeSVG } from "qrcode.react";
// import {
//   XMarkIcon,
//   CreditCardIcon,
//   DevicePhoneMobileIcon,
//   BanknotesIcon,
//   BuildingLibraryIcon,
//   ShieldCheckIcon,
//   CheckCircleIcon,
//   ExclamationCircleIcon,
//   ArrowLeftIcon,
// } from "@heroicons/react/24/outline";
// import { api } from "@/lib/api";

// // Payment method icons with dark mode support
// const paymentMethods = [
//   { id: "card", label: "Card", icon: "💳", color: "blue" },
//   { id: "upi", label: "UPI", icon: "📱", color: "green" },
//   { id: "paypal", label: "PayPal", icon: "💰", color: "indigo" },
//   { id: "razorpay", label: "Razorpay", icon: "🏦", color: "purple" },
//   { id: "cash", label: "Cash", icon: "💵", color: "amber" },
// ];

// export default function PaymentModal({
//   isOpen,
//   onClose,
//   invoiceId,
//   onSuccess,
//   onError,
//   amountPay
// }) {
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [processing, setProcessing] = useState(false);
//   const [selectedMethod, setSelectedMethod] = useState("card");
//   const [amount, setAmount] = useState(0);
//   const [upiId, setUpiId] = useState("");
//   const [upiQRCode, setUpiQRCode] = useState(null);
//   const [showQR, setShowQR] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState(null);
//   const [cardDetails, setCardDetails] = useState({
//     number: "",
//     expiry: "",
//     cvv: "",
//     name: "",
//   });
//   const [error, setError] = useState(null);
//   const [conversionInfo, setConversionInfo] = useState(null);
//   const [showConversionConfirm, setShowConversionConfirm] = useState(false);
//   const [paypalResponseData, setPaypalResponseData] = useState(null);
//   const modalRef = useRef(null);

//   useEffect(() => {
//     if (isOpen && invoiceId) {
//       fetchInvoice();
//       // Reset states when modal opens
//       setPaymentStatus(null);
//       setError(null);
//       setShowQR(false);
//       setProcessing(false);
//       setConversionInfo(null);
//       setShowConversionConfirm(false);
//       setPaypalResponseData(null);
//     }
//   }, [isOpen, invoiceId]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (modalRef.current && !modalRef.current.contains(event.target)) {
//         onClose();
//       }
//     };

//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "hidden";
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "unset";
//     };
//   }, [isOpen, onClose]);

//   const fetchInvoice = async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(`/invoices/${invoiceId}`);
//       setInvoice(response.data.data);
//       setAmount(amountPay || parseFloat(response.data.data.total_amount) || 0);
//     } catch (error) {
//       console.error("Error fetching invoice:", error);
//       setError("Failed to load invoice details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateUPIQR = () => {
//     if (!upiId || !amount) {
//       setError("Please enter UPI ID and amount");
//       return;
//     }
    
//     const upiString = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Payment%20for%20Invoice%20${invoice?.invoice_number}`;
//     setUpiQRCode(upiString);
//     setShowQR(true);
//   };

//   const handleStripePayment = async () => {
//     setProcessing(true);
//     setError(null);
//     try {
//       const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
      
//       const response = await api.post(`/invoices/${invoiceId}/payments`, {
//         method: "stripe",
//         amount,
//         paymentMethodId: "pm_card_visa",
//       });

//       if (response.data.success) {
//         const { error } = await stripe.confirmPayment({
//           clientSecret: response.data.data.clientSecret,
//         });

//         if (error) {
//           throw new Error(error.message);
//         } else {
//           setPaymentStatus("success");
//           onSuccess?.();
//           setTimeout(() => onClose(), 2000);
//         }
//       }
//     } catch (error) {
//       setError(error.message);
//       setPaymentStatus("error");
//       onError?.(error.message);
//     } finally {
//       setProcessing(false);
//     }
//   };

  
// const handlePayPalPayment = async () => {
//   setProcessing(true);
//   setError(null);
//   setConversionInfo(null);
//   setShowConversionConfirm(false);
//   setPaypalResponseData(null);
  
//   try {
//     const response = await api.post(`/invoices/${invoiceId}/payments`, {
//       method: "paypal",
//       amount,
//       currency: "USD",
//     });

//     console.log("📥 Full Response:", response);
//     console.log("📥 Response Data:", response.data);

//     if (response.data.success) {
//       const paymentData = response.data.data;
//       console.log("📊 Payment Data:", paymentData);
      
//       // Store response data for redirect
//       setPaypalResponseData(response.data);
      
//       // Check if we have all required data
//       if (!paymentData) {
//         throw new Error('No payment data received');
//       }
      
//       // Ensure we have conversion data with fallbacks
//       const originalCurrency = paymentData.originalCurrency || 'INR';
//       const originalAmount = paymentData.originalAmount || amount.toString();
//       const displayCurrency = paymentData.displayCurrency || 'USD';
//       const displayAmount = paymentData.displayAmount || paymentData.convertedAmount || '0.00';
//       const rate = paymentData.conversionRate || 0.012;
      
//       // Prepare conversion info
//       const conversionInfoData = {
//         originalCurrency: originalCurrency,
//         originalAmount: originalAmount,
//         displayCurrency: displayCurrency,
//         displayAmount: displayAmount,
//         convertedCurrency: paymentData.convertedCurrency || 'USD',
//         convertedAmount: paymentData.convertedAmount || '0.00',
//         rate: rate,
//         isConverted: paymentData.isConverted !== undefined ? paymentData.isConverted : true,
//         message: paymentData.message || `Your payment of ${originalAmount} ${originalCurrency} will be processed as ${displayAmount} ${displayCurrency}`
//       };
      
//       console.log("📊 Conversion Info:", conversionInfoData);
      
//       // Store conversion info
//       setConversionInfo(conversionInfoData);
      
//       // Show confirmation dialog
//       setShowConversionConfirm(true);
//       setProcessing(false);
//     } else {
//       throw new Error(response.data.message || 'Payment initiation failed');
//     }
//   } catch (error) {
//     console.error('❌ PayPal Payment Error:', error);
//     const errorMsg = error.response?.data?.message || error.message || 'Failed to process PayPal payment';
//     setError(errorMsg);
//     setPaymentStatus("error");
//     onError?.(errorMsg);
//     setProcessing(false);
//   }
// };

// // Handle conversion confirmation
// const confirmConversionAndRedirect = () => {
//   setShowConversionConfirm(false);
//   setProcessing(true);
  
//   try {
//     // Get the approval URL from stored response
//     const approvalUrl = paypalResponseData?.data?.approvalUrl;
    
//     console.log("🔗 Redirecting to:", approvalUrl);
    
//     if (!approvalUrl) {
//       throw new Error('No approval URL found');
//     }
    
//     // Store conversion info in sessionStorage for success page
//     if (conversionInfo) {
//       sessionStorage.setItem('paypal_conversion', JSON.stringify(conversionInfo));
//     }
    
//     // Redirect to PayPal
//     window.location.href = approvalUrl;
//   } catch (error) {
//     console.error('❌ Redirect error:', error);
//     setError('Failed to redirect to PayPal. Please try again.');
//     setPaymentStatus("error");
//     setProcessing(false);
//   }
// };
//   const handleRazorpayPayment = async () => {
//     setProcessing(true);
//     setError(null);
//     try {
//       const response = await api.post(`/invoices/${invoiceId}/payments`, {
//         method: "razorpay",
//         amount,
//         currency: "INR",
//       });

//       if (response.data.success) {
//         const options = {
//           key: response.data.data.keyId,
//           amount: response.data.data.amount,
//           currency: "INR",
//           name: "BluAI Healthcare",
//           description: `Payment for Invoice #${invoice?.invoice_number}`,
//           order_id: response.data.data.orderId,
//           handler: async function (response) {
//             try {
//               const verifyResponse = await api.post("/razorpay/verify", {
//                 orderId: response.razorpay_order_id,
//                 paymentId: response.razorpay_payment_id,
//                 signature: response.razorpay_signature,
//                 invoiceId: invoiceId,
//                 amount: amount * 100,
//               });

//               if (verifyResponse.data.success) {
//                 setPaymentStatus("success");
//                 onSuccess?.();
//                 setTimeout(() => onClose(), 2000);
//               }
//             } catch (error) {
//               setError("Payment verification failed");
//               setPaymentStatus("error");
//               onError?.(error.message);
//             }
//           },
//           modal: {
//             ondismiss: function() {
//               setProcessing(false);
//             }
//           },
//           prefill: {
//             name: invoice?.patient?.first_name + " " + invoice?.patient?.last_name,
//             email: invoice?.patient?.email || "",
//             contact: invoice?.patient?.phone || "",
//           },
//           theme: {
//             color: "#6366f1",
//           },
//         };

//         const rzp = new window.Razorpay(options);
//         rzp.open();
//       }
//     } catch (error) {
//       setError(error.message);
//       setPaymentStatus("error");
//       onError?.(error.message);
//       setProcessing(false);
//     }
//   };

//   const handleUPIPayment = async () => {
//     setProcessing(true);
//     setError(null);
//     try {
//       const response = await api.post(`/invoices/${invoiceId}/payments`, {
//         method: "upi",
//         amount,
//         upiId,
//       });

//       if (response.data.success) {
//         setUpiQRCode(response.data.data.upiUrl);
//         setShowQR(true);
//         setPaymentStatus("pending");
        
//         // Simulate payment confirmation
//         setTimeout(() => {
//           setPaymentStatus("success");
//           onSuccess?.();
//           setTimeout(() => onClose(), 2000);
//         }, 5000);
//       }
//     } catch (error) {
//       setError(error.message);
//       setPaymentStatus("error");
//       onError?.(error.message);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleCashPayment = async () => {
//     setProcessing(true);
//     setError(null);
//     try {
//       const response = await api.post(`/invoices/${invoiceId}/payments`, {
//         method: "cash",
//         amount,
//         notes: "Cash payment received",
//       });

//       if (response.data.success) {
//         setPaymentStatus("success");
//         onSuccess?.();
//         setTimeout(() => onClose(), 2000);
//       }
//     } catch (error) {
//       setError(error.message);
//       setPaymentStatus("error");
//       onError?.(error.message);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handlePayment = () => {
//     setError(null);
//     if (!amount || amount <= 0) {
//       setError("Please enter a valid amount");
//       return;
//     }
    
//     switch (selectedMethod) {
//       case "card":
//         if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
//           setError("Please fill all card details");
//           return;
//         }
//         handleStripePayment();
//         break;
//       case "paypal":
//         handlePayPalPayment();
//         break;
//       case "razorpay":
//         handleRazorpayPayment();
//         break;
//       case "upi":
//         if (!upiId) {
//           setError("Please enter UPI ID");
//           return;
//         }
//         handleUPIPayment();
//         break;
//       case "cash":
//         handleCashPayment();
//         break;
//       default:
//         setError("Please select a payment method");
//     }
//   };

//   const resetPayment = () => {
//     setPaymentStatus(null);
//     setError(null);
//     setShowQR(false);
//     setProcessing(false);
//     setUpiQRCode(null);
//     setConversionInfo(null);
//     setShowConversionConfirm(false);
//     setPaypalResponseData(null);
//   };

//   const renderPaymentForm = () => {
//     if (paymentStatus === "success") {
//       return (
//         <div className="text-center py-8">
//           <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
//             <CheckCircleIcon className="w-12 h-12 text-green-500 dark:text-green-400" />
//           </div>
//           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h3>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">Your payment has been processed successfully.</p>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Invoice #{invoice?.invoice_number}</p>
//           {conversionInfo && (
//             <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
//               <p className="text-xs text-blue-800 dark:text-blue-300">
//                 💱 Amount charged: {conversionInfo.displayAmount} {conversionInfo.displayCurrency}
//                 <br />
//                 <span className="text-[10px] opacity-75">
//                   Original: {conversionInfo.originalAmount} {conversionInfo.originalCurrency}
//                 </span>
//               </p>
//             </div>
//           )}
//         </div>
//       );
//     }

//     if (paymentStatus === "error") {
//       return (
//         <div className="text-center py-8">
//           <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
//             <ExclamationCircleIcon className="w-12 h-12 text-red-500 dark:text-red-400" />
//           </div>
//           <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Failed</h3>
//           <p className="text-gray-600 dark:text-gray-400 mt-2">{error || "Something went wrong. Please try again."}</p>
//           <button
//             onClick={resetPayment}
//             className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
//           >
//             Try Again
//           </button>
//         </div>
//       );
//     }

//     if (showQR && upiQRCode) {
//       return (
//         <div className="text-center py-4">
//           <button
//             onClick={() => setShowQR(false)}
//             className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
//           >
//             <ArrowLeftIcon className="w-4 h-4" />
//             Back to payment options
//           </button>
//           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scan QR Code to Pay</h3>
//           <div className="bg-white dark:bg-gray-700 p-4 rounded-lg inline-block shadow-md">
//             <QRCodeSVG value={upiQRCode} size={200} />
//           </div>
//           <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
//             Scan with any UPI app to complete payment
//           </p>
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-all font-mono">{upiQRCode}</p>
//           <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
//             <p className="text-xs text-yellow-800 dark:text-yellow-300">
//               ⏳ Payment will be confirmed automatically after scanning
//             </p>
//           </div>
//         </div>
//       );
//     }

//     // Currency Conversion Confirmation Dialog
//     if (showConversionConfirm && conversionInfo) {
//       return (
//         <div className="py-4">
//           <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
//             <div className="flex items-start gap-3">
//               <div className="text-2xl">💱</div>
//               <div className="flex-1">
//                 <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
//                   Currency Conversion Required
//                 </h4>
//                 <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
//                   {conversionInfo.message || `PayPal doesn't support ${conversionInfo.originalCurrency} directly. Your payment will be converted to ${conversionInfo.displayCurrency}.`}
//                 </p>
//                 <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 space-y-2">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500 dark:text-gray-400">Original Amount:</span>
//                     <span className="font-medium text-gray-900 dark:text-white">
//                       {conversionInfo.originalAmount} {conversionInfo.originalCurrency}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
//                     <span className="text-gray-500 dark:text-gray-400">Amount to be Charged:</span>
//                     <span className="font-medium text-indigo-600 dark:text-indigo-400">
//                       {conversionInfo.displayAmount} {conversionInfo.displayCurrency}
//                     </span>
//                   </div>
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-500 dark:text-gray-400">Exchange Rate:</span>
//                     <span className="font-medium text-gray-900 dark:text-white">
//                       1 {conversionInfo.originalCurrency} = {conversionInfo.rate} {conversionInfo.displayCurrency}
//                     </span>
//                   </div>
//                 </div>
//                 <p className="text-xs text-gray-500 dark:text-gray-400">
//                   ⚠️ The final amount charged may vary slightly due to exchange rate fluctuations.
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           <div className="flex gap-3">
//             <button
//               onClick={() => {
//                 setShowConversionConfirm(false);
//                 setConversionInfo(null);
//                 setProcessing(false);
//                 setPaypalResponseData(null);
//               }}
//               className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={confirmConversionAndRedirect}
//               className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
//             >
//               Continue to PayPal
//             </button>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <>
//         {/* Payment Methods Grid */}
//         <div className="grid grid-cols-5 gap-2 mb-6">
//           {paymentMethods.map((method) => (
//             <button
//               key={method.id}
//               onClick={() => {
//                 setSelectedMethod(method.id);
//                 setShowQR(false);
//                 setError(null);
//                 setConversionInfo(null);
//                 setShowConversionConfirm(false);
//                 setPaypalResponseData(null);
//               }}
//               className={`p-3 border-2 rounded-xl text-center transition-all ${
//                 selectedMethod === method.id
//                   ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
//                   : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700"
//               }`}
//             >
//               <div className="text-2xl">{method.icon}</div>
//               <div className="text-xs font-medium mt-1 text-gray-700 dark:text-gray-300">{method.label}</div>
//             </button>
//           ))}
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//             <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
//           </div>
//         )}

//         {/* Amount Input */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//             Amount (₹)
//           </label>
//           <div className="relative">
//             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
//               ₹
//             </span>
//             <input
//               type="number"
//               value={amount}
//               onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
//               className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
//               placeholder="0.00"
//               step="0.01"
//               min="0"
//             />
//           </div>
//         </div>

//         {/* Dynamic Payment Form */}
//         {selectedMethod === "upi" && (
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//               UPI ID
//             </label>
//             <input
//               type="text"
//               value={upiId}
//               onChange={(e) => setUpiId(e.target.value)}
//               placeholder="example@upi"
//               className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
//             />
//             <button
//               onClick={generateUPIQR}
//               className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
//             >
//               Generate QR Code
//             </button>
//           </div>
//         )}

//         {selectedMethod === "card" && (
//           <div className="space-y-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Card Number
//               </label>
//               <input
//                 type="text"
//                 value={cardDetails.number}
//                 onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()})}
//                 placeholder="4242 4242 4242 4242"
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
//                 maxLength="19"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                 Cardholder Name
//               </label>
//               <input
//                 type="text"
//                 value={cardDetails.name}
//                 onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
//                 placeholder="John Doe"
//                 className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
//               />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   Expiry
//                 </label>
//                 <input
//                   type="text"
//                   value={cardDetails.expiry}
//                   onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
//                   placeholder="MM/YY"
//                   className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
//                   maxLength="5"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                   CVV
//                 </label>
//                 <input
//                   type="password"
//                   value={cardDetails.cvv}
//                   onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
//                   placeholder="123"
//                   className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
//                   maxLength="4"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {selectedMethod === "paypal" && (
//           <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
//             <p className="text-sm text-blue-800 dark:text-blue-300">
//               You will be redirected to PayPal to complete your payment securely.
//             </p>
//             {conversionInfo && !showConversionConfirm && (
//               <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
//                 <p className="text-xs text-yellow-800 dark:text-yellow-300">
//                   💱 Currency Conversion: {conversionInfo.originalAmount} {conversionInfo.originalCurrency} 
//                   → {conversionInfo.displayAmount} {conversionInfo.displayCurrency}
//                   <br />
//                   <span className="text-[10px] opacity-75">
//                     Rate: 1 {conversionInfo.originalCurrency} = {conversionInfo.rate} {conversionInfo.displayCurrency}
//                   </span>
//                 </p>
//               </div>
//             )}
//             {!conversionInfo && (
//               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                 Payment will be processed in USD
//               </p>
//             )}
//           </div>
//         )}

//         {selectedMethod === "razorpay" && (
//           <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
//             <p className="text-sm text-purple-800 dark:text-purple-300">
//               Secure payment via Razorpay. You can pay using UPI, Card, or Net Banking.
//             </p>
//           </div>
//         )}

//         {selectedMethod === "cash" && (
//           <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
//             <p className="text-sm text-green-800 dark:text-green-300">
//               Cash payment will be recorded. Please confirm receipt.
//             </p>
//           </div>
//         )}

//         {/* Pay Button */}
//         <button
//           onClick={handlePayment}
//           disabled={processing || loading || showConversionConfirm}
//           className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//         >
//           {processing ? (
//             <>
//               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Processing...
//             </>
//           ) : (
//             `Pay ₹${parseFloat(amount || 0).toFixed(2)}`
//           )}
//         </button>

//         <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
//           <ShieldCheckIcon className="w-4 h-4" />
//           Your payment is secure and encrypted
//         </p>
//       </>
//     );
//   };

//   if (!isOpen) return null;

//   return (
//     <>
//       <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" />
//       <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

//       <div className="fixed inset-0 z-50 overflow-y-auto">
//         <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
//           {/* Backdrop */}
//           <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 transition-opacity backdrop-blur-sm" />

//           {/* Modal */}
//           <div
//             ref={modalRef}
//             className="inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all sm:my-8"
//           >
//             {/* Header */}
//             <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 px-6 py-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-xl font-bold text-white">Payment Portal</h2>
//                   <p className="text-indigo-100 dark:text-indigo-200 text-sm">
//                     Invoice #{invoice?.invoice_number || "Loading..."}
//                   </p>
//                 </div>
//                 <button
//                   onClick={onClose}
//                   className="text-white hover:text-indigo-200 dark:hover:text-indigo-300 transition"
//                 >
//                   <XMarkIcon className="w-6 h-6" />
//                 </button>
//               </div>
//             </div>

//             {/* Body */}
//             <div className="px-6 py-4">
//               {loading ? (
//                 <div className="flex items-center justify-center py-12">
//                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
//                 </div>
//               ) : (
//                 <>
//                   {/* Invoice Summary */}
//                   {invoice && (
//                     <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
//                       <div className="flex justify-between items-center">
//                         <div>
//                           <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
//                           <p className="font-semibold text-gray-900 dark:text-white">
//                             {invoice.patient?.first_name} {invoice.patient?.last_name}
//                           </p>
//                           <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
//                             {invoice.patient?.email || "No email"}
//                           </p>
//                         </div>
//                         <div className="text-right">
//                           <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
//                           <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
//                             ₹{parseFloat(invoice.total_amount).toFixed(2)}
//                           </p>
//                         </div>
//                       </div>
//                       {invoice.due_date && (
//                         <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
//                           Due: {new Date(invoice.due_date).toLocaleDateString()}
//                         </div>
//                       )}
//                       {invoice.status && (
//                         <div className="mt-1 text-xs">
//                           <span className={`px-2 py-0.5 rounded-full ${
//                             invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
//                             invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
//                             'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
//                           }`}>
//                             {invoice.status.replace('_', ' ')}
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {renderPaymentForm()}
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }







"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Script from "next/script";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  XMarkIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  PrinterIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BankIcon,
  CurrencyRupeeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/lib/api";

// Comprehensive payment methods configuration
const paymentMethods = [
  { 
    id: "card", 
    label: "Card", 
    icon: "💳", 
    color: "blue",
    description: "Credit/Debit Card",
    category: "digital"
  },
  { 
    id: "upi", 
    label: "UPI", 
    icon: "📱", 
    color: "green",
    description: "Google Pay, PhonePe, etc.",
    category: "digital"
  },
  { 
    id: "net_banking", 
    label: "Net Banking", 
    icon: "🏦", 
    color: "purple",
    description: "All major banks",
    category: "digital"
  },
  { 
    id: "paypal", 
    label: "PayPal", 
    icon: "💰", 
    color: "indigo",
    description: "International payments",
    category: "digital"
  },
  { 
    id: "razorpay", 
    label: "Razorpay", 
    icon: "⚡", 
    color: "cyan",
    description: "Quick & secure",
    category: "digital"
  },
  { 
    id: "cash", 
    label: "Cash", 
    icon: "💵", 
    color: "amber",
    description: "Pay in person",
    category: "offline"
  },
  { 
    id: "cheque", 
    label: "Cheque", 
    icon: "📝", 
    color: "teal",
    description: "Bank cheque",
    category: "offline"
  },
  { 
    id: "insurance", 
    label: "Insurance", 
    icon: "🛡️", 
    color: "rose",
    description: "Insurance claim",
    category: "offline"
  },
  { 
    id: "corporate", 
    label: "Corporate", 
    icon: "🏢", 
    color: "slate",
    description: "Corporate billing",
    category: "offline"
  },
];

// Bank list for net banking
const banks = [
  { id: "sbi", name: "State Bank of India", code: "SBIN" },
  { id: "hdfc", name: "HDFC Bank", code: "HDFC" },
  { id: "icici", name: "ICICI Bank", code: "ICICI" },
  { id: "axis", name: "Axis Bank", code: "AXIS" },
  { id: "kotak", name: "Kotak Mahindra Bank", code: "KOTAK" },
  { id: "yes", name: "Yes Bank", code: "YES" },
  { id: "idfc", name: "IDFC First Bank", code: "IDFC" },
  { id: "indusind", name: "IndusInd Bank", code: "INDUS" },
  { id: "pnb", name: "Punjab National Bank", code: "PNB" },
  { id: "bob", name: "Bank of Baroda", code: "BOB" },
  { id: "canara", name: "Canara Bank", code: "CANARA" },
  { id: "union", name: "Union Bank of India", code: "UNION" },
];

// Insurance providers
const insuranceProviders = [
  { id: "star", name: "Star Health Insurance" },
  { id: "aditya", name: "Aditya Birla Health Insurance" },
  { id: "max", name: "Max Bupa Health Insurance" },
  { id: "hdfc_ergo", name: "HDFC ERGO Health Insurance" },
  { id: "icici_lombard", name: "ICICI Lombard Health Insurance" },
  { id: "bajaj", name: "Bajaj Allianz Health Insurance" },
  { id: "reliance", name: "Reliance Health Insurance" },
  { id: "tata", name: "Tata AIG Health Insurance" },
  { id: "other", name: "Other" },
];

export default function PaymentModal({
  isOpen,
  onClose,
  invoiceId,
  onSuccess,
  onError,
  amountPay,
  currency = "INR",
}) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("card");
  const [amount, setAmount] = useState(0);
  const [upiId, setUpiId] = useState("");
  const [upiQRCode, setUpiQRCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [chequeDetails, setChequeDetails] = useState({
    number: "",
    bank: "",
    date: "",
    amount: "",
    name: "",
  });
  const [insuranceDetails, setInsuranceDetails] = useState({
    provider: "",
    policyNumber: "",
    claimNumber: "",
    amount: "",
    approval: "",
    notes: "",
  });
  const [corporateDetails, setCorporateDetails] = useState({
    company: "",
    department: "",
    employeeId: "",
    costCenter: "",
    approval: "",
    poNumber: "",
    notes: "",
  });
  const [netBankingDetails, setNetBankingDetails] = useState({
    bank: "",
    accountNumber: "",
    ifsc: "",
    name: "",
  });
  const [error, setError] = useState(null);
  const [conversionInfo, setConversionInfo] = useState(null);
  const [showConversionConfirm, setShowConversionConfirm] = useState(false);
  const [paypalResponseData, setPaypalResponseData] = useState(null);
  const [razorpayInstance, setRazorpayInstance] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("payment");
  const [paymentMethodCategory, setPaymentMethodCategory] = useState("all");
  
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  // Filter payment methods by category
  const getFilteredMethods = () => {
    if (paymentMethodCategory === "all") return paymentMethods;
    return paymentMethods.filter(m => m.category === paymentMethodCategory);
  };

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchInvoice();
      fetchPaymentHistory();
      // Reset states when modal opens
      setPaymentStatus(null);
      setError(null);
      setShowQR(false);
      setProcessing(false);
      setConversionInfo(null);
      setShowConversionConfirm(false);
      setPaypalResponseData(null);
      setActiveTab("payment");
    }
  }, [isOpen, invoiceId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/invoices/${invoiceId}`);
      setInvoice(response.data.data);
      setAmount(amountPay || parseFloat(response.data.data.total_amount) || 0);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setError("Failed to load invoice details");
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/payments`);
      setPaymentHistory(response.data.data || []);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    }
  };

  const generateUPIQR = () => {
    if (!upiId || !amount) {
      setError("Please enter UPI ID and amount");
      return;
    }
    
    const upiString = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=Payment%20for%20Invoice%20${invoice?.invoice_number}`;
    setUpiQRCode(upiString);
    setShowQR(true);
  };

  // ==================== CARD PAYMENT ====================
  const handleCardPayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const stripe = window.Stripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
      
      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "card",
        amount,
        currency,
        cardDetails,
      });

      if (response.data.success) {
        if (response.data.data.clientSecret) {
          const { error } = await stripe.confirmPayment({
            clientSecret: response.data.data.clientSecret,
          });

          if (error) {
            throw new Error(error.message);
          }
        }
        
        setPaymentStatus("success");
        await fetchPaymentHistory();
        onSuccess?.();
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      setError(error.message);
      setPaymentStatus("error");
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ==================== UPI PAYMENT ====================
  const handleUPIPayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "upi",
        amount,
        upiId,
      });

      if (response.data.success) {
        setUpiQRCode(response.data.data.upiUrl);
        setShowQR(true);
        setPaymentStatus("pending");
        
        // Simulate payment confirmation
        const checkInterval = setInterval(async () => {
          try {
            const statusResponse = await api.get(`/invoices/${invoiceId}/payments/status`);
            if (statusResponse.data.data.status === "completed") {
              clearInterval(checkInterval);
              setPaymentStatus("success");
              await fetchPaymentHistory();
              onSuccess?.();
              setTimeout(() => onClose(), 2000);
            }
          } catch (e) {
            console.error("Status check error:", e);
          }
        }, 3000);

        // Timeout after 2 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          if (paymentStatus !== "success") {
            setPaymentStatus("pending");
          }
        }, 120000);
      }
    } catch (error) {
      setError(error.message);
      setPaymentStatus("error");
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ==================== NET BANKING ====================
  const handleNetBankingPayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      // Validate required fields
      if (!netBankingDetails.bank) {
        setError("Please select a bank");
        setProcessing(false);
        return;
      }

      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "net_banking",
        amount,
        bankDetails: netBankingDetails,
      });

      if (response.data.success) {
        setPaymentStatus("success");
        await fetchPaymentHistory();
        onSuccess?.();
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      setError(error.message);
      setPaymentStatus("error");
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ==================== PAYPAL PAYMENT ====================
  const handlePayPalPayment = async () => {
    setProcessing(true);
    setError(null);
    setConversionInfo(null);
    setShowConversionConfirm(false);
    setPaypalResponseData(null);
    
    try {
      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "paypal",
        amount,
        currency: "USD",
      });

      if (response.data.success) {
        const paymentData = response.data.data;
        setPaypalResponseData(response.data);
        
        if (!paymentData) {
          throw new Error('No payment data received');
        }
        
        const originalCurrency = paymentData.originalCurrency || 'INR';
        const originalAmount = paymentData.originalAmount || amount.toString();
        const displayCurrency = paymentData.displayCurrency || 'USD';
        const displayAmount = paymentData.displayAmount || paymentData.convertedAmount || '0.00';
        const rate = paymentData.conversionRate || 0.012;
        
        const conversionInfoData = {
          originalCurrency,
          originalAmount,
          displayCurrency,
          displayAmount,
          convertedCurrency: paymentData.convertedCurrency || 'USD',
          convertedAmount: paymentData.convertedAmount || '0.00',
          rate,
          isConverted: paymentData.isConverted !== undefined ? paymentData.isConverted : true,
          message: paymentData.message || `Your payment of ${originalAmount} ${originalCurrency} will be processed as ${displayAmount} ${displayCurrency}`
        };
        
        setConversionInfo(conversionInfoData);
        setShowConversionConfirm(true);
        setProcessing(false);
      } else {
        throw new Error(response.data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('❌ PayPal Payment Error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to process PayPal payment';
      setError(errorMsg);
      setPaymentStatus("error");
      onError?.(errorMsg);
      setProcessing(false);
    }
  };

  const confirmConversionAndRedirect = () => {
    setShowConversionConfirm(false);
    setProcessing(true);
    
    try {
      const approvalUrl = paypalResponseData?.data?.approvalUrl;
      
      if (!approvalUrl) {
        throw new Error('No approval URL found');
      }
      
      if (conversionInfo) {
        sessionStorage.setItem('paypal_conversion', JSON.stringify(conversionInfo));
      }
      
      window.location.href = approvalUrl;
    } catch (error) {
      console.error('❌ Redirect error:', error);
      setError('Failed to redirect to PayPal. Please try again.');
      setPaymentStatus("error");
      setProcessing(false);
    }
  };

  // ==================== RAZORPAY PAYMENT ====================
  const handleRazorpayPayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "razorpay",
        amount,
        currency: "INR",
      });

      if (response.data.success) {
        const options = {
          key: response.data.data.keyId,
          amount: response.data.data.amount,
          currency: "INR",
          name: process.env.NEXT_PUBLIC_BRAND_NAME || "BluAI Healthcare",
          description: `Payment for Invoice #${invoice?.invoice_number}`,
          order_id: response.data.data.orderId,
          handler: async function (response) {
            try {
              const verifyResponse = await api.post("/razorpay/verify", {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                invoiceId: invoiceId,
                amount: amount * 100,
              });

              if (verifyResponse.data.success) {
                setPaymentStatus("success");
                await fetchPaymentHistory();
                onSuccess?.();
                setTimeout(() => onClose(), 2000);
              }
            } catch (error) {
              setError("Payment verification failed");
              setPaymentStatus("error");
              onError?.(error.message);
            }
          },
          modal: {
            ondismiss: function() {
              setProcessing(false);
            }
          },
          prefill: {
            name: invoice?.patient?.first_name + " " + invoice?.patient?.last_name,
            email: invoice?.patient?.email || "",
            contact: invoice?.patient?.phone || "",
          },
          theme: {
            color: "#6366f1",
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      setError(error.message);
      setPaymentStatus("error");
      onError?.(error.message);
      setProcessing(false);
    }
  };

  // ==================== CASH PAYMENT ====================
  const handleCashPayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "cash",
        amount,
        notes: "Cash payment received",
      });

      if (response.data.success) {
        setPaymentStatus("success");
        await fetchPaymentHistory();
        onSuccess?.();
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      setError(error.message);
      setPaymentStatus("error");
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ==================== CHEQUE PAYMENT ====================
  const handleChequePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      // Validate required fields
      if (!chequeDetails.number || !chequeDetails.bank || !chequeDetails.date) {
        setError("Please fill all required cheque details");
        setProcessing(false);
        return;
      }

      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "cheque",
        amount: chequeDetails.amount || amount,
        chequeDetails: {
          ...chequeDetails,
          date: new Date(chequeDetails.date).toISOString(),
        },
      });

      if (response.data.success) {
        setPaymentStatus("success");
        await fetchPaymentHistory();
        onSuccess?.();
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      setError(error.message);
      setPaymentStatus("error");
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ==================== INSURANCE PAYMENT ====================
  const handleInsurancePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      // Validate required fields
      if (!insuranceDetails.provider || !insuranceDetails.policyNumber) {
        setError("Please fill all required insurance details");
        setProcessing(false);
        return;
      }

      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "insurance",
        amount: insuranceDetails.amount || amount,
        insuranceDetails,
      });

      if (response.data.success) {
        setPaymentStatus("success");
        await fetchPaymentHistory();
        onSuccess?.();
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      setError(error.message);
      setPaymentStatus("error");
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ==================== CORPORATE PAYMENT ====================
  const handleCorporatePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      // Validate required fields
      if (!corporateDetails.company || !corporateDetails.employeeId) {
        setError("Please fill all required corporate details");
        setProcessing(false);
        return;
      }

      const response = await api.post(`/invoices/${invoiceId}/payments`, {
        method: "corporate",
        amount,
        corporateDetails,
      });

      if (response.data.success) {
        setPaymentStatus("success");
        await fetchPaymentHistory();
        onSuccess?.();
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      setError(error.message);
      setPaymentStatus("error");
      onError?.(error.message);
    } finally {
      setProcessing(false);
    }
  };

  // ==================== PAYMENT ROUTER ====================
  const handlePayment = () => {
    setError(null);
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    
    switch (selectedMethod) {
      case "card":
        if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
          setError("Please fill all card details");
          return;
        }
        handleCardPayment();
        break;
      case "paypal":
        handlePayPalPayment();
        break;
      case "razorpay":
        handleRazorpayPayment();
        break;
      case "upi":
        if (!upiId) {
          setError("Please enter UPI ID");
          return;
        }
        handleUPIPayment();
        break;
      case "net_banking":
        handleNetBankingPayment();
        break;
      case "cash":
        handleCashPayment();
        break;
      case "cheque":
        handleChequePayment();
        break;
      case "insurance":
        handleInsurancePayment();
        break;
      case "corporate":
        handleCorporatePayment();
        break;
      default:
        setError("Please select a payment method");
    }
  };

  const resetPayment = () => {
    setPaymentStatus(null);
    setError(null);
    setShowQR(false);
    setProcessing(false);
    setUpiQRCode(null);
    setConversionInfo(null);
    setShowConversionConfirm(false);
    setPaypalResponseData(null);
  };

  // ==================== RENDER PAYMENT FORM ====================
  const renderPaymentForm = () => {
    if (paymentStatus === "success") {
      return (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-12 h-12 text-green-500 dark:text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Your payment has been processed successfully.</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Invoice #{invoice?.invoice_number}</p>
          {conversionInfo && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💱 Amount charged: {conversionInfo.displayAmount} {conversionInfo.displayCurrency}
                <br />
                <span className="text-[10px] opacity-75">
                  Original: {conversionInfo.originalAmount} {conversionInfo.originalCurrency}
                </span>
              </p>
            </div>
          )}
        </div>
      );
    }

    if (paymentStatus === "error") {
      return (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleIcon className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Failed</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{error || "Something went wrong. Please try again."}</p>
          <button
            onClick={resetPayment}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (paymentStatus === "pending") {
      return (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <DevicePhoneMobileIcon className="w-12 h-12 text-yellow-500 dark:text-yellow-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Pending</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Waiting for payment confirmation...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Please complete the payment on your UPI app</p>
          {showQR && upiQRCode && (
            <div className="mt-4">
              <div className="bg-white dark:bg-gray-700 p-4 rounded-lg inline-block shadow-md">
                <QRCodeSVG value={upiQRCode} size={150} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-all font-mono">{upiQRCode}</p>
            </div>
          )}
        </div>
      );
    }

    if (showQR && upiQRCode) {
      return (
        <div className="text-center py-4">
          <button
            onClick={() => setShowQR(false)}
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to payment options
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scan QR Code to Pay</h3>
          <div className="bg-white dark:bg-gray-700 p-4 rounded-lg inline-block shadow-md">
            <QRCodeSVG value={upiQRCode} size={200} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Scan with any UPI app to complete payment
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-all font-mono">{upiQRCode}</p>
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              ⏳ Payment will be confirmed automatically after scanning
            </p>
          </div>
        </div>
      );
    }

    // Currency Conversion Confirmation Dialog
    if (showConversionConfirm && conversionInfo) {
      return (
        <div className="py-4">
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💱</div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Currency Conversion Required
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {conversionInfo.message || `PayPal doesn't support ${conversionInfo.originalCurrency} directly. Your payment will be converted to ${conversionInfo.displayCurrency}.`}
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Original Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {conversionInfo.originalAmount} {conversionInfo.originalCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span className="text-gray-500 dark:text-gray-400">Amount to be Charged:</span>
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {conversionInfo.displayAmount} {conversionInfo.displayCurrency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Exchange Rate:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      1 {conversionInfo.originalCurrency} = {conversionInfo.rate} {conversionInfo.displayCurrency}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ⚠️ The final amount charged may vary slightly due to exchange rate fluctuations.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowConversionConfirm(false);
                setConversionInfo(null);
                setProcessing(false);
                setPaypalResponseData(null);
              }}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={confirmConversionAndRedirect}
              className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
            >
              Continue to PayPal
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* Category Filter */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setPaymentMethodCategory("all")}
            className={`px-3 py-1.5 text-xs rounded-full transition ${
              paymentMethodCategory === "all"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setPaymentMethodCategory("digital")}
            className={`px-3 py-1.5 text-xs rounded-full transition ${
              paymentMethodCategory === "digital"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Digital
          </button>
          <button
            onClick={() => setPaymentMethodCategory("offline")}
            className={`px-3 py-1.5 text-xs rounded-full transition ${
              paymentMethodCategory === "offline"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            Offline
          </button>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {getFilteredMethods().map((method) => (
            <button
              key={method.id}
              onClick={() => {
                setSelectedMethod(method.id);
                setShowQR(false);
                setError(null);
                setConversionInfo(null);
                setShowConversionConfirm(false);
                setPaypalResponseData(null);
              }}
              className={`p-3 border-2 rounded-xl text-center transition-all ${
                selectedMethod === method.id
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md"
                  : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <div className="text-2xl">{method.icon}</div>
              <div className="text-xs font-medium mt-1 text-gray-700 dark:text-gray-300">{method.label}</div>
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount ({currency})
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
              {currency === "INR" ? "₹" : "$"}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Dynamic Payment Form */}
        {renderDynamicForm()}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={processing || loading || showConversionConfirm}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            `Pay ${currency === "INR" ? "₹" : "$"}${parseFloat(amount || 0).toFixed(2)}`
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
          <ShieldCheckIcon className="w-4 h-4" />
          Your payment is secure and encrypted
        </p>
      </>
    );
  };

  // ==================== RENDER DYNAMIC FORM ====================
  const renderDynamicForm = () => {
    switch (selectedMethod) {
      case "upi":
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="example@upi"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            />
            <button
              onClick={generateUPIQR}
              className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
            >
              Generate QR Code
            </button>
          </div>
        );

      case "card":
        return (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({...cardDetails, number: e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()})}
                placeholder="4242 4242 4242 4242"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                maxLength="19"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry
                </label>
                <input
                  type="text"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                  placeholder="MM/YY"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                  maxLength="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CVV
                </label>
                <input
                  type="password"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                  placeholder="123"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                  maxLength="4"
                />
              </div>
            </div>
          </div>
        );

      case "net_banking":
        return (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Bank
              </label>
              <select
                value={netBankingDetails.bank}
                onChange={(e) => setNetBankingDetails({...netBankingDetails, bank: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              >
                <option value="">Select a bank</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} ({bank.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Holder Name
              </label>
              <input
                type="text"
                value={netBankingDetails.name}
                onChange={(e) => setNetBankingDetails({...netBankingDetails, name: e.target.value})}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Number (Optional)
              </label>
              <input
                type="text"
                value={netBankingDetails.accountNumber}
                onChange={(e) => setNetBankingDetails({...netBankingDetails, accountNumber: e.target.value})}
                placeholder="XXXXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IFSC Code (Optional)
              </label>
              <input
                type="text"
                value={netBankingDetails.ifsc}
                onChange={(e) => setNetBankingDetails({...netBankingDetails, ifsc: e.target.value.toUpperCase()})}
                placeholder="SBIN0001234"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                🔒 You will be redirected to your bank's secure payment page
              </p>
            </div>
          </div>
        );

      case "cheque":
        return (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cheque Number *
              </label>
              <input
                type="text"
                value={chequeDetails.number}
                onChange={(e) => setChequeDetails({...chequeDetails, number: e.target.value})}
                placeholder="123456"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                value={chequeDetails.bank}
                onChange={(e) => setChequeDetails({...chequeDetails, bank: e.target.value})}
                placeholder="State Bank of India"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cheque Date *
              </label>
              <input
                type="date"
                value={chequeDetails.date}
                onChange={(e) => setChequeDetails({...chequeDetails, date: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cheque Amount
              </label>
              <input
                type="number"
                value={chequeDetails.amount || amount}
                onChange={(e) => setChequeDetails({...chequeDetails, amount: parseFloat(e.target.value) || 0})}
                placeholder={amount.toString()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payee Name (Optional)
              </label>
              <input
                type="text"
                value={chequeDetails.name}
                onChange={(e) => setChequeDetails({...chequeDetails, name: e.target.value})}
                placeholder="BluAI Healthcare"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
          </div>
        );

      case "insurance":
        return (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Insurance Provider *
              </label>
              <select
                value={insuranceDetails.provider}
                onChange={(e) => setInsuranceDetails({...insuranceDetails, provider: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              >
                <option value="">Select provider</option>
                {insuranceProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Policy Number *
              </label>
              <input
                type="text"
                value={insuranceDetails.policyNumber}
                onChange={(e) => setInsuranceDetails({...insuranceDetails, policyNumber: e.target.value})}
                placeholder="POL-123456789"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Claim Number
              </label>
              <input
                type="text"
                value={insuranceDetails.claimNumber}
                onChange={(e) => setInsuranceDetails({...insuranceDetails, claimNumber: e.target.value})}
                placeholder="CLM-123456"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Claim Amount
              </label>
              <input
                type="number"
                value={insuranceDetails.amount || amount}
                onChange={(e) => setInsuranceDetails({...insuranceDetails, amount: parseFloat(e.target.value) || 0})}
                placeholder={amount.toString()}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approval / Authorization
              </label>
              <input
                type="text"
                value={insuranceDetails.approval}
                onChange={(e) => setInsuranceDetails({...insuranceDetails, approval: e.target.value})}
                placeholder="Approval reference number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={insuranceDetails.notes}
                onChange={(e) => setInsuranceDetails({...insuranceDetails, notes: e.target.value})}
                placeholder="Additional notes"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                rows="2"
              />
            </div>
          </div>
        );

      case "corporate":
        return (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={corporateDetails.company}
                onChange={(e) => setCorporateDetails({...corporateDetails, company: e.target.value})}
                placeholder="Acme Corp"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Department
              </label>
              <input
                type="text"
                value={corporateDetails.department}
                onChange={(e) => setCorporateDetails({...corporateDetails, department: e.target.value})}
                placeholder="Finance"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Employee ID *
              </label>
              <input
                type="text"
                value={corporateDetails.employeeId}
                onChange={(e) => setCorporateDetails({...corporateDetails, employeeId: e.target.value})}
                placeholder="EMP-12345"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost Center
              </label>
              <input
                type="text"
                value={corporateDetails.costCenter}
                onChange={(e) => setCorporateDetails({...corporateDetails, costCenter: e.target.value})}
                placeholder="CC-123"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Purchase Order Number
              </label>
              <input
                type="text"
                value={corporateDetails.poNumber}
                onChange={(e) => setCorporateDetails({...corporateDetails, poNumber: e.target.value})}
                placeholder="PO-12345"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approval / Authorization
              </label>
              <input
                type="text"
                value={corporateDetails.approval}
                onChange={(e) => setCorporateDetails({...corporateDetails, approval: e.target.value})}
                placeholder="Approval reference"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                value={corporateDetails.notes}
                onChange={(e) => setCorporateDetails({...corporateDetails, notes: e.target.value})}
                placeholder="Additional notes"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                rows="2"
              />
            </div>
          </div>
        );

      case "paypal":
        return (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              You will be redirected to PayPal to complete your payment securely.
            </p>
            {conversionInfo && !showConversionConfirm && (
              <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  💱 Currency Conversion: {conversionInfo.originalAmount} {conversionInfo.originalCurrency} 
                  → {conversionInfo.displayAmount} {conversionInfo.displayCurrency}
                  <br />
                  <span className="text-[10px] opacity-75">
                    Rate: 1 {conversionInfo.originalCurrency} = {conversionInfo.rate} {conversionInfo.displayCurrency}
                  </span>
                </p>
              </div>
            )}
            {!conversionInfo && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Payment will be processed in USD
              </p>
            )}
          </div>
        );

      case "razorpay":
        return (
          <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-sm text-purple-800 dark:text-purple-300">
              Secure payment via Razorpay. You can pay using UPI, Card, or Net Banking.
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              ⚡ Fast & secure checkout
            </p>
          </div>
        );

      case "cash":
        return (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <p className="text-sm text-green-800 dark:text-green-300">
              Cash payment will be recorded. Please confirm receipt.
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              💵 Please pay the exact amount to the cashier
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  // ==================== RENDER HISTORY ====================
  const renderHistory = () => {
    if (paymentHistory.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-500 dark:text-gray-400">No payment history found</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {paymentHistory.map((payment) => (
          <div
            key={payment.id}
            className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {payment.method.toUpperCase()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(payment.payment_date).toLocaleString()}
                </p>
                {payment.reference && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                    Ref: {payment.reference}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">
                  ₹{parseFloat(payment.amount).toFixed(2)}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  payment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {payment.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" />
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/80 transition-opacity backdrop-blur-sm" />

          {/* Modal */}
          <div
            ref={modalRef}
            className="inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all sm:my-8"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-700 dark:to-purple-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">Payment Portal</h2>
                  <p className="text-indigo-100 dark:text-indigo-200 text-sm">
                    Invoice #{invoice?.invoice_number || "Loading..."}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-indigo-200 dark:hover:text-indigo-300 transition"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab("payment")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "payment"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                💳 Payment
              </button>
              <button
                onClick={() => {
                  setActiveTab("history");
                  fetchPaymentHistory();
                }}
                className={`flex-1 px-4 py-3 text-sm font-medium transition ${
                  activeTab === "history"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                📋 History
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                </div>
              ) : (
                <>
                  {/* Invoice Summary */}
                  {invoice && activeTab === "payment" && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {invoice.patient?.first_name} {invoice.patient?.last_name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {invoice.patient?.email || "No email"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            ₹{parseFloat(invoice.total_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {invoice.due_date && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Due: {new Date(invoice.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {invoice.status && (
                        <div className="mt-1 text-xs">
                          <span className={`px-2 py-0.5 rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {invoice.status.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "payment" ? renderPaymentForm() : renderHistory()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}    