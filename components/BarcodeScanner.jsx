import { useRef } from "react";
import { useScanSpecimen } from "@/hooks/useScanSpecimen";

export default function BarcodeScanner() {
  const inputRef = useRef(null);
  const { mutate: scanSpecimen, isPending } = useScanSpecimen();

  const handleScan = (e) => {
    if (e.key !== "Enter") return;

    const input = e.target;
    const barcode = input.value.trim();

    if (!barcode || isPending) return;

    scanSpecimen(barcode, {
      onSuccess: () => {
        handleReset();
        playSuccess();
      },
      onError: (err) => {
        console.error(err?.response?.data?.message);
        handleReset();
        playError();
      },
    });
  };

  const handleReset = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const playSuccess = () => {
    new Audio("/sounds/success.mp3").play();
  };

  const playError = () => {
    new Audio("/sounds/error.mp3").play();
  };

  return (
    <input
      ref={inputRef}
      autoFocus
      placeholder="Scan barcode..."
      onKeyDown={handleScan}
      style={{
        width: "100%",
        padding: "12px",
        fontSize: "16px",
        border: "2px solid #1976d2",
        borderRadius: "8px",
        outline: "none",
      }}
    />
  );
}