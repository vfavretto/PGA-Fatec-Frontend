import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@components/layout/Layout";
import { Login } from "@features/auth/pages/Login";
import { Home } from "@features/dashboard/pages/Home";
import { ResetPassword } from "@features/auth/pages/ResetPassword";
import { Projects } from "@features/projects/pages/Projects";
import { AddProject } from "@/features/anexos/pages/AddProject";
import { Settings } from "@features/settings/pages/Settings";
import { useAuth } from "@hooks/useAuth";
import { SelectAnexo } from "@/features/anexos/pages/SelectAnexo";
import { SelectSubAnexo } from "@/features/anexos/pages/SelectSubAnexo";
import { BASE_ROUTE } from "@lib/config";
import { AnexoForm } from "@features/anexos/pages/AnexoForm";
import type { TipoUsuario } from "@/features/auth/services/authService";

// Componente para rotas protegidas
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={`${BASE_ROUTE}login`} replace />;
  }

  return children;
};

// Componente para rotas protegidas por papel
const RoleRoute = ({
  allow,
  children,
}: {
  allow: TipoUsuario[];
  children: JSX.Element;
}) => {
  const { user } = useAuth();
  const role = user?.tipo_usuario as TipoUsuario | undefined;

  if (!role || !allow.includes(role)) {
    return <Navigate to={`${BASE_ROUTE}dashboard`} replace />;
  }

  return children;
};

const NON_REGIONAL_ROLES: TipoUsuario[] = [
  "Administrador",
  "CPS",
  "Diretor",
  "Coordenador",
  "Administrativo",
  "Docente",
];

export const Router = (): JSX.Element => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path={`${BASE_ROUTE}login`}
        element={
          isAuthenticated ? (
            <Navigate to={`${BASE_ROUTE}dashboard`} replace />
          ) : (
            <Login />
          )
        }
      />

      <Route
        path={`${BASE_ROUTE}reset-password`}
        element={<ResetPassword />}
      />

      <Route
        path={`${BASE_ROUTE}*`}
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route
          index
          element={<Navigate to={`dashboard`} replace />}
        />
        <Route path="dashboard" element={<Home />} />

        <Route path="projects">
          <Route
            index
            element={
              <RoleRoute allow={NON_REGIONAL_ROLES}>
                <SelectAnexo />
              </RoleRoute>
            }
          />
          <Route path="list" element={<Projects />} />
          <Route
            path="new"
            element={
              <RoleRoute allow={NON_REGIONAL_ROLES}>
                <AddProject />
              </RoleRoute>
            }
          />
          <Route
            path="anexo/:anexoId"
            element={
              <RoleRoute allow={NON_REGIONAL_ROLES}>
                <SelectSubAnexo />
              </RoleRoute>
            }
          />
          <Route path="anexo/:anexoId/:subId" element={<Projects />} />
        </Route>

        <Route path="anexos">
          <Route
            path="new"
            element={
              <RoleRoute allow={NON_REGIONAL_ROLES}>
                <AnexoForm />
              </RoleRoute>
            }
          />
        </Route>

        <Route path="settings" element={<Settings />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? `${BASE_ROUTE}dashboard` : `${BASE_ROUTE}login`} />}
      />
    </Routes>
  );
};
