import { ExternalLink, FileText, PencilLine, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { formatDisplayDate } from "@/lib/appointment-utils";
import { getCurrentUserProfile } from "@/services/auth";
import { deleteDocument, listDocuments, updateDocument, uploadDocument } from "@/services/documents";
import { getPatientProfileByUserId } from "@/services/patients";

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const visibilityOptions = [
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "doctor_only", label: "Doctor only" },
];

const emptyForm = {
  file: null,
  document_type: "",
  visibility: "public",
};

function mapDocumentError(error, fallbackMessage) {
  const status = error?.response?.status;

  if (status === 413) {
    return "File too large. Maximum allowed size is 10MB.";
  }

  if (status === 422) {
    return "Invalid file type or document metadata.";
  }

  if (status === 404) {
    return "Patient or document was not found.";
  }

  if (status === 502) {
    return "Cloud upload failed. Please retry in a moment.";
  }

  if (status === 503) {
    return "Upload service is temporarily unavailable. Please try again later.";
  }

  return error?.response?.data?.detail || error?.response?.data?.message || fallbackMessage;
}

function isSupportedFile(file) {
  const lowerName = String(file?.name || "").toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

function formatVisibility(value) {
  if (value === "doctor_only") {
    return "Doctor only";
  }
  if (value === "private") {
    return "Private";
  }
  return "Public";
}

function getVisibilityBadgeClass(value) {
  if (value === "doctor_only") {
    return "bg-amber-100 text-amber-800";
  }
  if (value === "private") {
    return "bg-slate-200 text-slate-800";
  }
  return "bg-emerald-100 text-emerald-800";
}

function openDocumentUrl(fileUrl, visibility) {
  if (!fileUrl) {
    toast.error("Document link is missing.");
    return;
  }

  // Open directly to avoid CORS/HEAD probe failures from browser-side checks.
  window.open(fileUrl, "_blank", "noopener,noreferrer");

  if (visibility !== "public") {
    toast("If access is denied, request a signed URL for restricted visibility.");
  }
}

export default function PatientReportsPage() {
  const [patientId, setPatientId] = useState("");
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingDocId, setEditingDocId] = useState("");
  const [editForm, setEditForm] = useState({ document_type: "", visibility: "public" });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingDocId, setUpdatingDocId] = useState("");
  const [deletingDocId, setDeletingDocId] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isBusy = useMemo(
    () => isUploading || isRefreshing || Boolean(updatingDocId) || Boolean(deletingDocId),
    [deletingDocId, isRefreshing, isUploading, updatingDocId]
  );

  const fetchDocuments = async (resolvedPatientId, silent = false) => {
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const data = await listDocuments(resolvedPatientId);
      setDocuments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error(mapDocumentError(error, "Unable to load documents."));
    } finally {
      if (!silent) {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      setIsLoading(true);
      try {
        const authUser = await getCurrentUserProfile();
        const userId = authUser?.user_id || authUser?.id;

        if (!userId) {
          throw new Error("Authenticated user id not found.");
        }

        const profile = await getPatientProfileByUserId(userId);
        const resolvedPatientId = profile?.patient_id;

        if (!resolvedPatientId) {
          throw new Error("Patient profile not found.");
        }

        if (ignore) {
          return;
        }

        setPatientId(resolvedPatientId);
        await fetchDocuments(resolvedPatientId);
      } catch (error) {
        if (!ignore) {
          setIsLoading(false);
          toast.error(mapDocumentError(error, "Unable to initialize reports page."));
        }
      }
    }

    bootstrap();

    return () => {
      ignore = true;
    };
  }, []);

  const addReport = async (event) => {
    event.preventDefault();

    if (!patientId) {
      toast.error("Patient profile not found.");
      return;
    }

    if (!form.file) {
      toast.error("Please choose a file to upload.");
      return;
    }

    if (!form.document_type.trim()) {
      toast.error("Document type is required.");
      return;
    }

    if (!isSupportedFile(form.file)) {
      toast.error("Unsupported file type. Use PDF, JPG, JPEG, or PNG.");
      return;
    }

    if (form.file.size > MAX_FILE_SIZE_BYTES) {
      toast.error("File too large. Maximum allowed size is 10MB.");
      return;
    }

    setIsUploading(true);
    try {
      const created = await uploadDocument(patientId, form.file, form.document_type.trim(), form.visibility);
      setDocuments((prev) => [created, ...prev]);
      setForm(emptyForm);
      toast.success("Document uploaded successfully.");
    } catch (error) {
      toast.error(mapDocumentError(error, "Unable to upload document."));
    } finally {
      setIsUploading(false);
    }
  };

  const startEdit = (document) => {
    setEditingDocId(document.document_id);
    setEditForm({
      document_type: document.document_type || "",
      visibility: document.visibility || "public",
    });
  };

  const saveEdit = async (documentId) => {
    if (!patientId || !documentId) {
      return;
    }

    if (!editForm.document_type.trim()) {
      toast.error("Document type is required.");
      return;
    }

    setUpdatingDocId(documentId);
    try {
      const updated = await updateDocument(patientId, documentId, {
        document_type: editForm.document_type.trim(),
        visibility: editForm.visibility,
      });

      setDocuments((prev) =>
        prev.map((doc) => (doc.document_id === documentId ? { ...doc, ...updated } : doc))
      );
      setEditingDocId("");
      toast.success("Document metadata updated.");
    } catch (error) {
      toast.error(mapDocumentError(error, "Unable to update document."));
    } finally {
      setUpdatingDocId("");
    }
  };

  const removeDocument = async (documentId) => {
    if (!patientId || !documentId) {
      return;
    }

    setDeletingDocId(documentId);
    try {
      await deleteDocument(patientId, documentId);
      setDocuments((prev) => prev.filter((doc) => doc.document_id !== documentId));
      toast.success("Document deleted.");
    } catch (error) {
      toast.error(mapDocumentError(error, "Unable to delete document."));
    } finally {
      setDeletingDocId("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-10">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2 text-xl">
            <Upload className="size-5 text-primary" />
            Upload Report or Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto]" onSubmit={addReport}>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(event) => updateField("file", event.target.files?.[0] || null)}
              disabled={isBusy}
            />
            <Input
              placeholder="Document type (e.g. Lab Report)"
              value={form.document_type}
              onChange={(event) => updateField("document_type", event.target.value)}
              disabled={isBusy}
            />
            <select
              value={form.visibility}
              onChange={(event) => updateField("visibility", event.target.value)}
              disabled={isBusy}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={isBusy}>
              <Upload className="size-4" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
          <p className="mt-3 text-xs text-slate-500">Accepted formats: PDF, JPG, JPEG, PNG. Maximum size: 10MB.</p>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="inline-flex items-center gap-2 text-lg">
            <FileText className="size-5 text-primary" />
            My Documents
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => fetchDocuments(patientId, true)} disabled={isBusy || !patientId}>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">File name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Visibility</th>
                <th className="px-4 py-3">Uploaded</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((item) => {
                const isEditing = editingDocId === item.document_id;
                const isUpdatingThis = updatingDocId === item.document_id;
                const isDeletingThis = deletingDocId === item.document_id;

                return (
                  <tr key={item.document_id} className="border-t">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.file_name || "-"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {isEditing ? (
                        <Input
                          value={editForm.document_type}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, document_type: event.target.value }))}
                          disabled={isBusy}
                        />
                      ) : (
                        item.document_type || "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select
                          value={editForm.visibility}
                          onChange={(event) => setEditForm((prev) => ({ ...prev, visibility: event.target.value }))}
                          disabled={isBusy}
                          className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
                        >
                          {visibilityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span
                          className={[
                            "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                            getVisibilityBadgeClass(item.visibility),
                          ].join(" ")}
                        >
                          {formatVisibility(item.visibility)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDisplayDate(item.uploaded_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openDocumentUrl(item.file_url, item.visibility)}
                          disabled={isBusy || !item.file_url}
                        >
                          <ExternalLink className="size-3.5" />
                          Open
                        </Button>

                        {isEditing ? (
                          <>
                            <Button size="xs" onClick={() => saveEdit(item.document_id)} disabled={isBusy}>
                              {isUpdatingThis ? "Saving..." : "Save"}
                            </Button>
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => setEditingDocId("")}
                              disabled={isBusy}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button size="xs" variant="outline" onClick={() => startEdit(item)} disabled={isBusy}>
                            <PencilLine className="size-3.5" />
                            Edit
                          </Button>
                        )}

                        <Button
                          size="xs"
                          variant="destructive"
                          onClick={() => removeDocument(item.document_id)}
                          disabled={isBusy}
                        >
                          <Trash2 className="size-3.5" />
                          {isDeletingThis ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No documents yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
