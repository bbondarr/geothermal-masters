import { AdminTable } from "../components/AdminTable/AdminTable"
import { AdminTitle } from "../components/AdminnTitle/AdminTitle"
import Layout from "../components/Layout/Layout"

export function Admin() {
  return <Layout isProtectedPage={true}>
    <AdminTitle />
    <AdminTable />
  </Layout>
}