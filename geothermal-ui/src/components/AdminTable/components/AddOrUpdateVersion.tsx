import { UploadFile } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Container, Box, Typography, CircularProgress } from "@mui/material";

import './AddOrUpdateVersion.css';
import { ChangeEvent, useState } from "react";
import { useUpload } from "../../../hooks/useUpload";
import { UploadRequest } from "../../../types";
import { useSetRecoilState } from "recoil";
import { SnackbarState } from "../../../store/store";

interface AddOrUpdateVersionProps {
  open: boolean;
  onClose: () => void;
  versionToUpdate?: number
}

export function AddOrUpdateVersion(props: Readonly<AddOrUpdateVersionProps>) {
  const setSnackbar = useSetRecoilState(SnackbarState);
  const { mutateAsync, isPending } = useUpload();
  const [mapFile, setMapFile] = useState<File>();
  const [modelFile, setModelFile] = useState<File>();
  const [metadataFile, setMetadataFile] = useState<File>();
  const [testDataFile, setTestDataFile] = useState<File>();
  
  const handleSetFile = (e: ChangeEvent<HTMLInputElement>, setFilename: (name: File) => void) => {
    if (!e.target.files?.length) {
      return
    }
    const file = e.target.files[0];
    setFilename(file);
  }

  const handleClose = () => {
    if (!isPending) {
      // Очищення стейту
      setMapFile(undefined)
      setModelFile(undefined)
      setMetadataFile(undefined)
      setTestDataFile(undefined)
      props.onClose()
    }
  }

  const handleSave = () => {
    const payload: UploadRequest = {
      ...(mapFile ? { Map: mapFile } : {}),
      ...(modelFile ? { FinancialModel: modelFile } : {}),
      ...(testDataFile ? { TestData: testDataFile } : {}),
      ...(metadataFile ? { Metadata: metadataFile } : {})
    }

    if (!Object.keys(payload).length) {
      setSnackbar({
        open: true,
        title: 'Validation Error',
        message: (
          <Typography component="p">
            At least one file is required.
          </Typography>
        ),
        severity: 'error',
      })
      return
    }
    
    mutateAsync({ 
      files: payload,
      versionToUpdate: props.versionToUpdate
    })
      .catch((e) => console.log(e))
      .finally(handleClose)
  };

  return (
    <Dialog 
      fullWidth
      open={props.open} 
      onClose={handleClose}
    >
      <DialogTitle>Edit / Add Version</DialogTitle>
      <DialogContent>
        <Container className="fileInputContainer">
          <Button
            className="fileBtn"
            component="label"
            variant="outlined"
            startIcon={<UploadFile />}
          >
            Map
            <input type="file" accept=".tiff" hidden onChange={(e) => handleSetFile(e, setMapFile)} />
          </Button>
          <Box>{ mapFile?.name ?? "" }</Box>
        </Container>
        <Container className="fileInputContainer">
          <Button
            className="fileBtn"
            component="label"
            variant="outlined"
            startIcon={<UploadFile />}
          >
            Financial Model
            <input type="file" accept=".xlsx" hidden onChange={(e) => handleSetFile(e, setModelFile)} />
          </Button>
          <Box>{ modelFile?.name ?? "" }</Box>
        </Container>
        <Container className="fileInputContainer">
          <Button
            className="fileBtn"
            component="label"
            variant="outlined"
            startIcon={<UploadFile />}
          >
            Metadata
            <input type="file" accept=".json" hidden onChange={(e) => handleSetFile(e, setMetadataFile)} />
          </Button>
          <Box>{ metadataFile?.name ?? "" }</Box>
        </Container>
        <Container className="fileInputContainer">
          <Button
            className="fileBtn"
            component="label"
            variant="outlined"
            startIcon={<UploadFile />}
          >
            Test Data
            <input type="file" accept=".csv" hidden onChange={(e) => handleSetFile(e, setTestDataFile)} />
          </Button>
          <Box>{ testDataFile?.name ?? "" }</Box>
        </Container>
      </DialogContent>
      <DialogActions>
        <Button
          disabled={isPending} 
          variant="contained" 
          onClick={handleSave}
        >
          Save
          {
            isPending && <CircularProgress
              size={20}
              color="inherit"
              sx={{
                marginLeft: '0.5rem'
              }}
            />
          }
        </Button>
      </DialogActions>
    </Dialog>
  )
}