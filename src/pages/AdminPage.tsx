import { useState, FormEvent } from "react";
import { Resource } from "../types";
import { api } from "../api/client";
import { useResources } from "../hooks/useResources";
import ImageLightbox from "../components/ImageLightbox";

const parseTags = (value: string) =>
  value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
  });
  if (!res.ok) throw new Error("Image upload failed");
}

interface ResourceRowProps {
  resource: Resource;
  onUpdate: () => void; // Called after any change so the list refreshes
}

function ResourceRow({ resource, onUpdate }: ResourceRowProps) {
  const [editing, setEditing] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  // Pre-populate the edit form with the current resource values
  const [name, setName] = useState(resource.name);
  const [description, setDescription] = useState(resource.description ?? "");
  const [capacity, setCapacity] = useState(resource.capacity);
  const [imageUrl, setImageUrl] = useState(resource.image_url ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState((resource.tags ?? []).join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let finalImageUrl = imageUrl.trim() || null;
      if (imageFile) {
        const { upload_url, object_url } = await api.getImageUploadUrl(
          resource.id,
          imageFile.name,
          imageFile.type
        );
        await uploadToS3(upload_url, imageFile);
        finalImageUrl = object_url;
      }
      await api.updateResource(resource.id, {
        name,
        description,
        capacity,
        image_url: finalImageUrl,
        tags: parseTags(tags),
      });
      setEditing(false);
      onUpdate(); // Refresh the list so the updated values show immediately
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async () => {
    // Flip is_active to the opposite of its current value
    await api.updateResource(resource.id, { is_active: !resource.is_active });
    onUpdate();
  };

  return (
    <div className="group bg-card border border-border rounded-xl overflow-hidden hover:border-accent hover:shadow-lg transition-all duration-200">
      {!editing ? (
        <div className="flex gap-4 p-5">
          {/* Fixed-size image column */}
          <div className="w-36 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-surface border border-border">
            {resource.image_url ? (
              <img
                src={resource.image_url}
                alt={`${resource.name} preview`}
                className="h-full w-full object-cover cursor-zoom-in group-hover:scale-105 transition-transform duration-300"
                onClick={() => setLightbox(true)}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-600 text-xs italic">
                No image
              </div>
            )}
          </div>
          {lightbox && resource.image_url && (
            <ImageLightbox
              src={resource.image_url}
              alt={resource.name}
              onClose={() => setLightbox(false)}
            />
          )}
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {resource.name}
              </h3>
              <span
                className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                  resource.is_active ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                }`}
              >
                {resource.is_active ? "active" : "inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {resource.description ?? <span className="italic">No description</span>}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              Capacity: {resource.capacity}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
              Active bookings: {resource.active_booking_count ?? 0}
            </p>
            {!!resource.tags?.length && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {resource.tags.map((tag) => (
                  <span
                    key={`${resource.id}-${tag}`}
                    className="text-xs rounded-full bg-tag px-2.5 py-0.5 text-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            <button
              onClick={() => setEditing(true)}
              className="text-xs border border-border text-gray-400 rounded-lg px-3 py-1.5 hover:border-accent hover:text-gray-200 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={toggleActive}
              className={`text-xs border rounded-lg px-3 py-1.5 transition-colors ${
                resource.is_active
                  ? "border-red-800 text-red-400 hover:bg-red-900"
                  : "border-green-800 text-green-400 hover:bg-green-900"
              }`}
            >
              {resource.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-3">
          <input
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent transition-colors"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent transition-colors"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            min={1}
            required
          />
          <input
            type="url"
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent transition-colors"
            placeholder="Image URL (optional)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent transition-colors file:mr-3 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1 file:text-white"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
          <input
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent transition-colors"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border border-border text-gray-500 dark:text-gray-400 rounded-lg px-4 py-2 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// Separate component for the add resource form to keep AdminPage clean
function AddResourceForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resource = await api.createResource({
        name,
        description,
        capacity,
        tags: parseTags(tags),
      });
      let finalImageUrl = imageUrl.trim() || undefined;
      if (imageFile) {
        const { upload_url, object_url } = await api.getImageUploadUrl(
          resource.id,
          imageFile.name,
          imageFile.type
        );
        await uploadToS3(upload_url, imageFile);
        finalImageUrl = object_url;
      }
      if (finalImageUrl) {
        await api.updateResource(resource.id, { image_url: finalImageUrl });
      }
      // Reset the form fields after successful creation
      setName("");
      setDescription("");
      setCapacity(1);
      setImageUrl("");
      setImageFile(null);
      setTags("");
      setOpen(false);
      onAdded(); // Refresh the resource list
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Show just a button until the user clicks it
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity self-start"
      >
        + Add resource
      </button>
    );
  }

  return (
    // Highlight the form with an accent border to make it stand out from existing resources
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-accent rounded-xl p-5 flex flex-col gap-3"
    >
      <h3 className="font-semibold text-gray-900 dark:text-gray-100">New resource</h3>
      <input
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(Number(e.target.value))}
        min={1}
        required
      />
      <input
        type="url"
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent"
        placeholder="Image URL (optional)"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent file:mr-3 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1 file:text-white"
        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
      />
      <input
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-200 outline-none focus:border-accent"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="border border-border text-gray-500 dark:text-gray-400 rounded-lg px-4 py-2 text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AdminPage() {
  const { resources, loading, error, refetch } = useResources();

  return (
    <div className="flex flex-col gap-4">
      {/* Add form sits at the top so it's easy to find */}
      <AddResourceForm onAdded={refetch} />
      {loading && <p className="text-gray-600 dark:text-gray-400">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {resources.map((r) => (
        <ResourceRow key={r.id} resource={r} onUpdate={refetch} />
      ))}
    </div>
  );
}
