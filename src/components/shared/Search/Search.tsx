import styles from "./Search.module.scss";

export type SearchType = {
  handleChange?: (value: string) => void;
  handleSearch?: () => void;
  placeholder: string;
  label: string;
  showLabel?: boolean;
  id: string;
};

const Search = ({
  id,
  showLabel = false,
  handleChange,
  handleSearch,
  placeholder = "CHANGE ME",
  label = "Search",
}: SearchType) => {
  const handleSubmitSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && handleSearch) handleSearch();
  };

  return (
    <div className={styles.searchWrap}>
      {showLabel && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        type="search"
        placeholder={placeholder}
        onChange={(e) => handleChange?.(e.target.value)}
        aria-label={label}
        className={styles.searchInput}
        data-testid={`search-input${id}`}
        onKeyDown={handleSubmitSearch}
      />
    </div>
  );
};

export default Search;
