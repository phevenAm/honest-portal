import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAllResources,
  createResource,
  deleteResource,
  togglePublished,
  fetchResources,
  updateResource,
} from "../../../store/slices/resourcesSlice";
import Card from "../../../components/shared/Card/Card";
import Button from "../../../components/shared/Button/Button";
import styles from "./AdminResourcesPage.module.scss";
import type { AppDispatch, RootState } from "../../../store/index";
import type { Resource } from "../../../models/globalTypes";
import { ArticleIcon, DocumentIcon, LinkIcon, VideoIcon } from "../../../components/shared/Icons/Icons";
import { ResourceForm } from "./AdminResourcesPageForm";
import { useFetchOnIdle } from "../../../Hooks/Hooks";


const RESOURCE_TYPES = ["all", "article", "video", "document", "link"] as const;

const getResourceTypeLabel = (type: string) => {
  if (type === "all") return "All";
  if (type === "article") return "Articles";
  if (type === "video") return "Videos";
  if (type === "document") return "Documents";
  if (type === "link") return "Websites";

  return type;
};

const getResourceIcon = (type: Resource["type"]) => {
  if (type === "video") return <VideoIcon />;
  if (type === "document") return <span aria-hidden="true"><DocumentIcon/></span>;
  if (type === "link") return <span aria-hidden="true"><LinkIcon/></span>;

  return <ArticleIcon />;
};

export default function AdminResourcesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const resources: Resource[] = useSelector(selectAllResources);

  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [typeFilter, setTypeFilter] =
    useState<(typeof RESOURCE_TYPES)[number]>("all");

  useFetchOnIdle(
    (state: RootState) => state.resources.status,
    () => fetchResources(),
    "Failed to fetch resources:",
  );

  const filtered =
    typeFilter === "all"
      ? resources
      : resources.filter((resource) => resource.type === typeFilter);

  const publishedCount = resources.filter((resource) => resource.is_published).length;
  const draftCount = resources.filter((resource) => !resource.is_published).length;

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.pageHeader}>
          <div>
            <h1>Resources</h1>
            <p>
              {publishedCount} published · {draftCount} drafts
            </p>
          </div>

          <Button onClick={() => setShowForm(true)}>+ Add resource</Button>
        </div>

        <div className={styles.filterRow}>
          {RESOURCE_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={
                typeFilter === type ? styles.filterBtnActive : styles.filterBtn
              }
            >
              {getResourceTypeLabel(type)}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {filtered.map((resource) => (
            <Card key={resource.id}>
              <div className={styles.resourceRow}>
                <div className={styles.resourceIcon}>
                  {getResourceIcon(resource.type)}
                </div>

                <div className={styles.resourceInfo}>
                  <p className={styles.resourceTitle}>{resource.title}</p>

                  <p className={styles.resourceMeta}>
                    {getResourceTypeLabel(resource.type).replace(/s$/, "")} ·{" "}
                    {resource.category} · Last edited:{" "}
                    {resource.updated_at
                      ? new Date(resource.updated_at).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>

                <div className={styles.resourceActions}>
                  {resource.is_sensitive && (
                    <span className={`${styles.badge} ${styles.sensitive}`}>
                      Sensitive
                    </span>
                  )}
                  <span
                    className={`${styles.badge} ${
                      resource.is_published ? styles.published : styles.draft
                    }`}
                  >
                    {resource.is_published ? "Published" : "Draft"}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      dispatch(
                        togglePublished({
                          id: resource.id,
                          is_published: !resource.is_published,
                        }),
                      )
                    }
                  >
                    {resource.is_published ? "Unpublish" : "Publish"}
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setEditingResource(resource)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => dispatch(deleteResource(resource.id))}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <p className={styles.empty}>
              No {getResourceTypeLabel(typeFilter).toLowerCase()} resources yet.
            </p>
          )}
        </div>
      </div>

      {showForm && (
        <ResourceForm
          onSave={(data) => dispatch(createResource(data))}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingResource && (
        <ResourceForm
          resource={editingResource}
          onSave={(data) =>
            dispatch(updateResource({ id: editingResource.id, ...data }))
          }
          onClose={() => setEditingResource(null)}
        />
      )}
    </div>
  );
}