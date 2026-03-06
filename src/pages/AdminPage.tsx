import { useState, FormEvent } from "react";
import { Resource } from "../types";
import { api } from "../api/client";
import { useResources } from "../hooks/useResources";

interface ResourceRowProps {
  resource: Resource;
  onUpdate: () => void; // Called after any change so the list refreshes
}

function ResourceRow({ resource, onUpdate }: ResourceRowProps) {
  const [editing, setEditing] = useState(false);

  // Pre-populate the edit form with the current resource values
  const [name, setName] = useState(resource.name);
  const [description, setDescription] = useState(resource.description ?? "");
  const [capacity, setCapacity] = useState(resource.capacity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.updateResource(resource.id, { name, description, capacity });
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
    <div className="bg-card border border-border rounded-xl p-5">
      {/* Show either the read view or the edit form depending on state */}
      {!editing ? (
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-100">{resource.name}</h3>
              {/* Visual indicator of active/inactive status */}
              <span className={`text-xs px-2 py-0.5 rounded ${
                resource.is_active
                  ? "bg-green-900 text-green-400"
                  : "bg-red-900 text-red-400"
              }`}>
                {resource.is_active ? "active" : "inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{resource.description ?? "No description"}</p>
            <p className="text-xs text-gray-600 mt-0.5">Capacity: {resource.capacity}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-xs border border-border text-gray-400 rounded px-3 py-1 hover:text-gray-200"
            >
              Edit
            </button>
            <button
              onClick={toggleActive}
              className="text-xs border border-border text-gray-400 rounded px-3 py-1 hover:text-gray-200"
            >
              {resource.is_active ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <input
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number"
            className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
            value={capacity}
            // Number() converts the string from the input to a number
            onChange={(e) => setCapacity(Number(e.target.value))}
            min={1}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="border border-border text-gray-500 rounded-lg px-4 py-2 text-sm">
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createResource({ name, description, capacity });
      // Reset the form fields after successful creation
      setName(""); setDescription(""); setCapacity(1);
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
      <button onClick={() => setOpen(true)} className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold">
        + Add resource
      </button>
    );
  }

  return (
    // Highlight the form with an accent border to make it stand out from existing resources
    <form onSubmit={handleSubmit} className="bg-card border border-accent rounded-xl p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-gray-100">New resource</h3>
      <input
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="number"
        className="bg-surface border border-border rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
        placeholder="Capacity"
        value={capacity}
        onChange={(e) => setCapacity(Number(e.target.value))}
        min={1}
        required
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-accent text-white rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
          {loading ? "Adding..." : "Add"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="border border-border text-gray-500 rounded-lg px-4 py-2 text-sm">
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
      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {resources.map((r) => (
        <ResourceRow key={r.id} resource={r} onUpdate={refetch} />
      ))}
    </div>
  );
}
