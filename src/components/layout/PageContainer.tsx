
interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  sidebarCollapsed: boolean;
}
export function PageContainer({
  children,
  title,
  actions,
  sidebarCollapsed
}: PageContainerProps) {
  return <div className={`mt-16 min-h-screen bg-light-gray transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
      <div className="p-4 md:p-8">
        {title && <div className="mb-4 md:mb-6 flex flex-col md:flex-row items-start md:items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-dark-gray">{title}</h1>
              {actions && <div className="mt-2 md:hidden">{actions}</div>}
            </div>
            {actions && <div className="hidden md:flex items-center space-x-3 animate-in fade-in slide-in-from-right-4 duration-300" style={{animationDelay: '100ms'}}>{actions}</div>}
          </div>}
        {children}
      </div>
    </div>;
}
