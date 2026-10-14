import { Children, isValidElement, useEffect, useId, useRef, useState } from "react";

function Select({ id, value, onChange, children, required, disabled, className = "" }) {
  const generatedId = useId();
  const listboxId = `${id || generatedId}-options`;
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [openAbove, setOpenAbove] = useState(false);
  const options = Children.toArray(children)
    .filter((child) => isValidElement(child) && child.type === "option")
    .map((option, index) => ({
      key: option.key || `${option.props.value}-${index}`,
      value: String(option.props.value ?? ""),
      label: option.props.children,
      disabled: option.props.disabled,
    }));
  const selectedIndex = options.findIndex((option) => option.value === String(value ?? ""));
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!open) return undefined;

    const fecharAoClicarFora = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };

    document.addEventListener("pointerdown", fecharAoClicarFora);
    return () => document.removeEventListener("pointerdown", fecharAoClicarFora);
  }, [open]);

  useEffect(() => {
    if (open) {
      document.getElementById(`${listboxId}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, listboxId, open]);

  const abrir = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    setOpenAbove(Boolean(rect && window.innerHeight - rect.bottom < 300 && rect.top > window.innerHeight - rect.bottom));
    setActiveIndex(index);
    setOpen(true);
  };

  const selecionar = (option) => {
    if (option.disabled) return;
    onChange?.({ target: { value: option.value } });
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    const firstEnabled = options.findIndex((option) => !option.disabled);
    let lastEnabled = -1;
    for (let index = options.length - 1; index >= 0; index -= 1) {
      if (!options[index].disabled) {
        lastEnabled = index;
        break;
      }
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      if (!open) {
        abrir(event.key === "ArrowDown" ? (firstEnabled >= 0 ? firstEnabled : 0) : (lastEnabled >= 0 ? lastEnabled : 0));
        return;
      }
      setActiveIndex((current) => {
        let next = current;
        for (let count = 0; count < options.length; count += 1) {
          next = (next + direction + options.length) % options.length;
          if (!options[next].disabled) return next;
        }
        return current;
      });
      return;
    }

    if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "Home" && open) {
      event.preventDefault();
      if (firstEnabled >= 0) setActiveIndex(firstEnabled);
      return;
    }

    if (event.key === "End" && open) {
      event.preventDefault();
      if (lastEnabled >= 0) setActiveIndex(lastEnabled);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      if (options[activeIndex]) selecionar(options[activeIndex]);
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && !open) {
      event.preventDefault();
      abrir();
    }
  };

  const optionId = (index) => `${listboxId}-option-${index}`;

  return (
    <div
      ref={rootRef}
      className={`app-select ${className}`}
      data-open={open ? "true" : undefined}
    >
      <button
        ref={triggerRef}
        id={id || generatedId}
        type="button"
        className="app-select-trigger"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open && options[activeIndex] ? optionId(activeIndex) : undefined}
        aria-required={required || undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : abrir())}
        onKeyDown={handleKeyDown}
      >
        <span className={`app-select-value ${selectedOption ? "" : "is-placeholder"}`}>
          {selectedOption?.label || "Selecionar..."}
        </span>
        <span className="app-select-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div
          id={listboxId}
          className={`app-select-popover ${openAbove ? "is-above" : ""}`}
          role="listbox"
          aria-labelledby={id || generatedId}
        >
          {options.map((option, index) => (
            <div
              id={optionId(index)}
              key={option.key}
              className={[
                "app-select-option",
                index === selectedIndex ? "is-selected" : "",
                index === activeIndex ? "is-active" : "",
                option.disabled ? "is-disabled" : "",
              ].filter(Boolean).join(" ")}
              role="option"
              aria-selected={index === selectedIndex}
              aria-disabled={option.disabled || undefined}
              onMouseEnter={() => !option.disabled && setActiveIndex(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => selecionar(option)}
            >
              <span className="app-select-option-label">{option.label}</span>
              {index === selectedIndex && <span className="app-select-check" aria-hidden="true">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Select;
