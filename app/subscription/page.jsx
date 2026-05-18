"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function CreateTenantForm() {

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit } = useForm({
        defaultValues: {
            name: "",
            subdomain: "",
            plan: "standard",
            schemaName: "",
            billingEmail: "",
            technicalContact: "",
        },
    });

    const onSubmit = async (data) => {
        try {
            setLoading(true);

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/tenants/add`,
                data
            );

            console.log("Success:", response.data);

            toast.success("Tenant created successfully");

            router.push("/auth/login");

        } catch (error) {
            console.error("Error:", error?.response?.data || error.message);

            toast.error(error?.response?.data?.message || "Failed to create tenant");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="form-wrapper">
                <div className="card">
                    <h2 className="title">Create Lab / Tenant</h2>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Row 1 */}
                        <div className="row">
                            <div className="field">
                                <label>Lab Name</label>
                                <input {...register("name")} placeholder="Enter lab name" />
                            </div>

                            <div className="field">
                                <label>Subdomain</label>
                                <input {...register("subdomain")} placeholder="example.com" />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="row">
                            <div className="field">
                                <label>Plan</label>
                                <select {...register("plan")}>
                                    <option value="free">Free</option>
                                    <option value="starter">Starter</option>
                                    <option value="standard">Standard</option>
                                    <option value="professional">Professional</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>

                            <div className="field">
                                <label>Schema Name</label>
                                <input
                                    {...register("schemaName")}
                                    placeholder="schema_name"
                                />
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="row">
                            <div className="field">
                                <label>Billing Email</label>
                                <input
                                    type="text"
                                    {...register("billingEmail")}
                                    placeholder="billing@example.com"
                                />
                            </div>

                            <div className="field">
                                <label>Technical Contact</label>
                                <input
                                    type="text"
                                    {...register("technicalContact")}
                                    placeholder="tech@example.com"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="actions">
                            <button type="button" className="btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" className="btn-primary">
                                Create Tenant
                            </button>
                        </div>
                    </form>
                </div>
            </div>


        </div>
    );
}