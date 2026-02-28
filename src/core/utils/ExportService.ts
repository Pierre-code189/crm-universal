import xlsx from "json-as-xlsx";

export const exportToExcel = (data: any[], schema: any) => {
  if (!data || data.length === 0) return;

  // Preparamos el contenido mapeando las etiquetas del esquema
  const content = data.map((item) => {
    const row: any = {};
    schema.fields.forEach((field: any) => {
      row[field.label] = item[field.name] || "";
    });
    return row;
  });

  // Definimos las columnas usando las etiquetas del esquema
  const columns = schema.fields.map((field: any) => ({
    label: field.label,
    value: field.label,
  }));

  const settings = {
    fileName: `Reporte_${schema.title}_${new Date().toISOString().split('T')[0]}`,
    extraLength: 3,
  };

  const sheetData = [
    {
      sheet: schema.title,
      columns: columns,
      content: content,
    },
  ];

  // Ejecutamos la descarga
  xlsx(sheetData, settings);
};