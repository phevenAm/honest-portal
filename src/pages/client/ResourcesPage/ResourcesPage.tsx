import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  selectPublishedResources,
  fetchPublishedResources,
} from "../../../store/slices/resourcesSlice";
import Card from "../../../components/shared/Card/Card";
import styles from "./ResourcesPage.module.scss";
import type { Resource } from "../../../models/globalTypes";
import { useFetchOnIdle } from "../../../Hooks/Hooks";
import type { RootState } from "../../../store/index";
import { ArticleIcon, VideoIcon } from "../../../components/shared/Icons/Icons";

function ResourceModal({
  resource,
  onClose,
}: {
  resource: Resource;
  onClose: () => void;
}) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="resource-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>

        <span className={styles.categoryBadge}>
          {resource.type === "video" ? <VideoIcon /> : <ArticleIcon />}
          {resource.category}
        </span>

        <h2 id="resource-title" className={styles.modalTitle}>
          {resource.title}
        </h2>

        <p className={styles.modalSummary}>{resource.summary}</p>

        {resource.type === "article" && resource.content && (
          <div className={styles.modalContent}>{resource.content}</div>
        )}

        {resource.type === "video" && (
          <div className={styles.videoWrap}>
            <iframe
              src={resource.videoUrl}
              title={resource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {(resource.type === "document" || resource.type === "link") && (
          <div className={styles.externalWrap}>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalBtn}
            >
              {resource.type === "document" ? "Open document" : "Visit website"}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceCard({
  resource,
  onOpen,
}: {
  resource: Resource;
  onOpen: (resource: Resource) => void;
}) {
    const handleClick = () => {
    if (resource.type === "document" || resource.type === "link") {
      window.open(resource.url, "_blank");
    } else {
      onOpen(resource);
    }
  };
  return (
    <Card>
      <div
        className={styles.accentBar}
        style={{ background: "var(--accent)" }}
      />

      <div className={styles.cardBody}>
        <span className={styles.categoryBadge}>
          {resource.type === "video" ? <VideoIcon /> : <ArticleIcon />}
          {resource.category}
        </span>

        <h3 className={styles.cardTitle}>{resource.title}</h3>

        <p className={styles.excerpt}>{resource.summary}</p>

        <div className={styles.cardFooter}>
          <button
            onClick={handleClick}
            className={styles.readMoreBtn}
          >
            {resource.type === "video"
              ? "Watch"
              : resource.type === "document"
                ? "Open document"
                : resource.type === "link"
                  ? "Visit site"
                  : "Read"}
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function ResourcesPage() {
  const resources = useSelector(selectPublishedResources);
  const [filter, setFilter] = useState("all");
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );

  useFetchOnIdle(
    (state: RootState) => state.resources.status,
    fetchPublishedResources,
    "Failed to fetch resources:",
  );

  const types = ["all", ...new Set(resources.map((r) => r.type))];

  const filtered =
    filter === "all" ? resources : resources.filter((r) => r.type === filter);

  return (
    <div className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h1>Resources</h1>
          <p>Curated by your practitioner — take your time with these.</p>
        </div>

        <div
          role="tablist"
          aria-label="Filter resources by type"
          className={styles.filterRow}
        >
          {types.map((type: string) => (
            <button
              key={type}
              role="tab"
              aria-selected={filter === type}
              onClick={() => setFilter(type)}
              className={
                filter === type ? styles.filterBtnActive : styles.filterBtn
              }
            >
              {type === "all" ? "All resources" : `${type}s`}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onOpen={setSelectedResource}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className={styles.empty}>No resources available yet.</p>
        )}
      </div>

      {selectedResource && (
        <ResourceModal
          resource={selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )}
    </div>
  );
}
