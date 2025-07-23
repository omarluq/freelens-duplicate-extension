import React from "react";

export const withErrorPage = <T extends object>(_props: T, component: () => React.ReactElement) => {
  try {
    return component();
  } catch (error) {
    console.error("Error in Pod Duplicate extension:", error);

    return (
      <div
        style={{
          padding: "20px",
          color: "var(--textColorError)",
          background: "var(--colorError)",
          borderRadius: "4px",
        }}
      >
        <h4>Pod Duplicate Extension Error</h4>
        <p>An error occurred in the Pod Duplicate extension. Please check the console for details.</p>
        <small>{error instanceof Error ? error.message : String(error)}</small>
      </div>
    );
  }
};
