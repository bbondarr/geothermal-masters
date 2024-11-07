import { Button, Checkbox, CircularProgress, Container, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useVersions } from "../../hooks/useVersions";
import { AdminTableCell } from "./components/AdminTableCell";
import { useCallback, useState } from "react";
import { usePublish } from "../../hooks/usePublish";
import { AddOrUpdateVersion } from "./components/AddOrUpdateVersion";
import { useSetRecoilState } from "recoil";
import { SnackbarState } from "../../store/store";

export function AdminTable() {
  const setSnackBar = useSetRecoilState(SnackbarState);
  const { data } = useVersions();
  const [versionToUpdate, setVersionToUpdate] = useState<number | undefined>();
  const [selectedVersion, setSelectedVersion] = useState<number>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const { isPending, mutateAsync } = usePublish();

  const handleUpload = useCallback(() => {
    if (data?.length) {
      const lastVersion = data[0];
      if (!lastVersion.isPublished) {
        setVersionToUpdate(lastVersion.version)
      }
    }

    setDialogOpen(true);
  }, [data])

  const onCloseDialog = () => {
    setVersionToUpdate(undefined);
    setDialogOpen(false)
  }

  return <Paper sx={{ margin: '2rem 0', boxShadow: 'none' }}>
    <Container
      disableGutters
      sx={{ display: "flex", justifyContent: "space-between", marginBottom: '2rem' }}
    >
      <Button
        variant="text"
        disabled={isPending || !selectedVersion}
        onClick={() => {
          setSnackBar({
            open: true,
            severity: "info",
            title: "Info",
            message: "Map updating started."
          })
          mutateAsync(selectedVersion!)
            .catch((e) => console.log(e))
            .finally(() => setSelectedVersion(undefined))
        }}
        sx={{ textTransform: 'none' }}
      >
        Publish Version
        {isPending && <CircularProgress
          size={20}
          color="inherit"
          sx={{
            marginLeft: '0.5rem'
          }}
        />
      }
      </Button>
      <Button
        disabled={isPending}
        variant="text"
        onClick={handleUpload}
        sx={{ textTransform: 'none' }}
      >
        Edit Latest/Add New Version
      </Button>
    </Container>
    <TableContainer sx={{ maxHeight: '27.5rem' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <AdminTableCell ></AdminTableCell>
            <AdminTableCell>Version</AdminTableCell>
            <AdminTableCell>Test Status</AdminTableCell>
            <AdminTableCell>Is Published</AdminTableCell>
            <AdminTableCell>Published Date</AdminTableCell>
            <AdminTableCell>Last Upload Date</AdminTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.map((versionItem, index) => (
            <TableRow key={index}>
              <AdminTableCell>
                <Checkbox
                  disabled={isPending}
                  checked={versionItem.version === selectedVersion}
                  onClick={() => {
                    if (versionItem.version === selectedVersion) {
                      setSelectedVersion(undefined)
                    } else {
                      setSelectedVersion(versionItem.version)
                    }
                  }}
                />
              </AdminTableCell>
              <AdminTableCell>{versionItem.version}</AdminTableCell>
              <AdminTableCell>{versionItem.testStatus}</AdminTableCell>
              <AdminTableCell>{versionItem.isPublished ? "*" : ""}</AdminTableCell>
              <AdminTableCell>{versionItem.publishDate}</AdminTableCell>
              <AdminTableCell>{versionItem.lastUploadDate}</AdminTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <AddOrUpdateVersion
      open={dialogOpen}
      onClose={onCloseDialog}
      versionToUpdate={versionToUpdate}
    />
  </Paper>
}