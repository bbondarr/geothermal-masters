import { Button } from "@mui/material";
import Layout from "../components/Layout/Layout";
import { Title } from "../components/Title/Title";
import { useCallback, useRef } from "react";

import './IFrame.css';

export function IFramePage({ url }: Readonly<{ url?: string }>) {
  const ref = useRef<HTMLIFrameElement>(null);

  const handleFocus = useCallback(() => {
    ref.current?.scrollIntoView();
  }, [ref])

  return (
    <Layout>
      <Title />
      <Button
        className="optimalZoomBtn"
        variant="outlined"
        onClick={handleFocus}
      >
        Optimal zoom
      </Button>
      <iframe
        ref={ref}
        style={{
          overflow: 'hidden'
        }}
        title="ContentPage"
        width="100%"
        height="1300px"
        frameBorder="0"
        src={url ? url : `${window.location.origin}/`}
      />
    </Layout>
  )
}