import { useState } from "react";
import api from "../api/axios";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";

export default function CreateArticlePage() {
	const [title, setTitle] = useState("");
	const [categoryName, setCategoryName] = useState("");
	const [subcategoryName, setSubcategoryName] = useState("");
	const [description, setDescription] = useState("");
	const [contactInfo, setContactInfo] = useState("");
	const [services, setServices] = useState([]);

	const [toast, setToast] = useState(null);
	const [operationalHours, setOperationalHours] = useState("");

	const [isPublishing, setIsPublishing] = useState(false);
	const navigate = useNavigate();

	// Default categories list
	const defaultCategories = [
		"Hotels",
		"Cinema",
		"Government Institutions",
		"Private Institutions",
			"Embassys",
		"Government Hospitals",
		"Private Hospitals",
		"Restaurants",
		"Cahrity",
		"Real Estate",
		"Banks",
		"Government Mass Media",
		"Private Mass Media",
		"Libraries",
		"Museums",
		"Parks and Recreation",
		"Insurance Companies",
		"Addis Ababa Sbubcity Police Stations",
		"Electricity Supply Faults",
		"Ambulance Services",
		"Eye Clinics",
		"Dental Clinics",
		"Agriculture Services",
		"Travel Agencies",
		"Tour Operators",
		"Transportation Services",
		"Shopping Centers",
		"Educational Institutions",
		"Event Venues",
		"Nightlife",
		"Healthcare Services",
		"Financial Services",
		"Technology Services",
		"Agriculture",
		"Fire Brigade Stations",
	];

	const handlePublish = async () => {
		console.log("Publishing article with data:", {
			title,
			categoryName,
			subcategoryName,
			description,
			contactInfo,
			services,
			operationalHours,
		});

		if (!title || !categoryName || !subcategoryName || !description) {
			alert(
				"Please fill all required fields: Title, Category, Subcategory, Description",
			);
			return;
		}
		setIsPublishing(true);

		try {
			//Create category (only 'name' is required now)
			const categoryData = { name: categoryName, description: categoryName };
			console.log("Creating category:", categoryData);

			const categoryRes = await api.post("/category", {
				name: categoryName,
				description: categoryName,
			});
			console.log("Category response:", categoryRes.data);

			const categoryId = categoryRes.data.category.id;
			console.log("category id:", { categoryId });

			//Create subcategory
			const subcategoryData = { name: subcategoryName };
			console.log(
				`Creating subcategory under category${categoryId}:`,
				subcategoryData,
			);

			const subcategoryRes = await api.post(
				`/subcategory/${categoryId}/subcategories`,
				{ name: subcategoryName },
			);
			console.log("Subcategory response:", subcategoryRes.data);

			const subcategoryId = subcategoryRes.data.subcategory.id;
			console.log("subcategory id:", subcategoryId);

			// Create article
			const articlePayload = {
				title,
				description,
				contactInfo: contactInfo || "Not Provided",
				services: services.length > 0 ? services : ["general"],
				operationalHours: operationalHours,
			};

			console.log(
				`Creating article under category ${categoryId}, subcategory, ${subcategoryId}`,
				articlePayload,
			);

			const articleRes = await api.post(
				`/article/categories/${categoryId}/subcategories/${subcategoryId}`,
				articlePayload,
			);

			console.log("Article Response:", articleRes.data);

			// success toast
			setToast({ message: "Article created successfully!", type: "success" });

			//  Reset form
			setTitle("");
			setCategoryName("");
			setSubcategoryName("");
			setDescription("");
			setContactInfo("");
			setServices([]);
			setOperationalHours("");
		} catch (err) {
			if (err.response) {
				console.error("Error response data:", err.response.data);
				console.error("Error response status:", err.response.status);
				alert(
					`Error: ${err.response.data.detail || err.response.data.message}`,
				);
			} else {
				console.error("Error creating article:", err);
				alert("Something went wrong. Check console for details.");
			}
		} finally {
			setIsPublishing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4">
			<div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-8">
				<h2 className="text-2xl font-semibold mb-6">
					Create New Knowledge Base Article
				</h2>

				{/* MAIN GRID */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* LEFT SIDE */}
					<div className="space-y-4">
						{/* TITLE */}
						<div>
							<label className="text-sm text-gray-600">Article Title *</label>
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="E.g. Sheraton Addis Hotel"
								className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 focus:ring focus:ring-blue-200 outline-none"
							/>
						</div>

						{/* CATEGORY */}
						<div>
							<label className="text-sm text-gray-600">Category *</label>
							<input
								list="category-suggestions"
								type="text"
								value={categoryName}
								onChange={(e) => setCategoryName(e.target.value)}
								placeholder="Type or select a category"
								className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 focus:ring focus:ring-blue-200 outline-none"
							/>
							{/* Datalist provides the dropdown options */}
							<datalist id="category-suggestions">
								{defaultCategories.map((cat) => (
									<option key={cat} value={cat} />
								))}
							</datalist>
						</div>

						{/* SUBCATEGORY */}
						<div>
							<label className="text-sm text-gray-600">Location *</label>
							<input
								type="text"
								value={subcategoryName}
								onChange={(e) => setSubcategoryName(e.target.value)}
								placeholder="Addis Ababa"
								className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 focus:ring focus:ring-blue-200 outline-none"
							/>
						</div>
					</div>

					{/* DESCRIPTION */}
					<div>
						<label className="text-sm text-gray-600">Description *</label>

						<div className="relative">
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full mt-1 border border-gray-300 rounded-lg p-3 h-64 focus:ring focus:ring-blue-200 outline-none resize-none"
								placeholder="Write details here..."
							/>
						</div>
					</div>

					{/* DESCRIPTION */}
				</div>

				{/* SECOND ROW */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					{/* CONTACT + FACILITIES */}
					<div className="space-y-4">
						<div>
							<label className="text-sm text-gray-600">Phone (Optional)</label>
							<input
								type="text"
								value={contactInfo}
								onChange={(e) => setContactInfo(e.target.value)}
								placeholder="+2511234567"
								className="w-full mt-1 border border-gray-300 rounded-lg p-2.5"
							/>
						</div>

						{/* FACILITIES */}
						<div>
							<label className="text-sm text-gray-600">
								Facilities (Optional)
							</label>
							<input
								type="text"
								// value={services}
								placeholder="Type and press Enter to add"
								className="w-full mt-2 border border-gray-300 rounded-lg p-2.5"
								onKeyDown={(e) => {
									if (e.key === "Enter" && e.target.value.trim()) {
										e.preventDefault();
										setServices([...services, e.target.value.trim()]);
										e.target.value = "";
									}
								}}
							/>
							<div className="flex flex-wrap gap-2 mt-3">
								{services.map((item, index) => (
									<div
										key={index}
										className="flex items-center gap-2 px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
									>
										{item}
										<button
											onClick={() =>
												setServices(services.filter((_, i) => i !== index))
											}
											className="text-blue-700 hover:text-red-600"
										>
											×
										</button>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* RIGHT SIDE */}
					<div className="space-y-4">
						<div>
							<label className="text-sm text-gray-600">
								Operational Hours (Optional)
							</label>
							<textarea
								type="text"
								value={operationalHours}
								onChange={(e) => setOperationalHours(e.currentTarget.value)}
								placeholder="Mon - Fri | 9:00 - 5:00"
								className="w-full mt-1 border border-gray-300 rounded-lg p-2.5 min-h-[100px] resize-y"
							/>
						</div>
					</div>
				</div>

				{/* BUTTONS */}
				<div className="flex justify-end gap-4 mt-8">
					<button
						onClick={() => navigate("/content-editor")}
						className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
					>
						Cancel
					</button>

					<button
						onClick={handlePublish}
						disabled={isPublishing} // 🔹 disable while publishing
						className={`px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition
		${
			isPublishing
				? "bg-blue-400 cursor-not-allowed"
				: "bg-blue-600 hover:bg-blue-700 text-white"
		}`}
					>
						{isPublishing ? (
							<>
								{/* 🔹 Spinner */}
								<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								Publishing...
							</>
						) : (
							"Publish"
						)}
					</button>
				</div>
			</div>

			{/* Toast */}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={() => setToast(null)}
				/>
			)}
		</div>
	);
}
