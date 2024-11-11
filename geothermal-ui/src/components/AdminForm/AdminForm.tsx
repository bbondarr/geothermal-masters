import React from 'react';

export const AdminForm = () => {
  return (
    <div style={styles.container}>

      <form style={styles.form}>
        {/* Геодані */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Геодані</h2>

          <div style={styles.fieldContainer}>
            <label style={styles.label}>
              GIS файл <span style={styles.subscript}>(GeoTIFF)</span>
            </label>
            <input type="file" style={styles.fileInput} />
          </div>
        </div>

        <div style={styles.horizontalDivider}></div>

        {/* Генератор */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Генератор</h2>
          {generatorFields.map((field) => (
            <div key={field.name} style={styles.fieldContainer}>
              <label style={styles.label}>
                {field.name} <span style={styles.subscript}>({field.subscript})</span>
              </label>
              <div style={styles.inputContainer}>
                <input
                  type="number"
                  defaultValue={field.defaultValue}
                  style={styles.input}
                />
                <span style={styles.unit}>{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.horizontalDivider}></div>

        {/* Капітальні вкладення */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Капітальні вкладення</h2>
          {capitalExpenditureFields.map((field) => (
            <div key={field.name} style={styles.fieldContainer}>
              <label style={styles.label}>
                {field.name} <span style={styles.subscript}>({field.subscript})</span>
              </label>
              <div style={styles.inputContainer}>
                <input
                  type="number"
                  defaultValue={field.defaultValue}
                  style={styles.input}
                />
                <span style={styles.unit}>{field.unit}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.horizontalDivider}></div>

        {/* Операційні витрати */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Операційні витрати</h2>
          {operatingCostFields.map((field) => (
            <div key={field.name} style={styles.fieldContainer}>
              <label style={styles.label}>
                {field.name} <span style={styles.subscript}>({field.subscript})</span>
              </label>
              <div style={styles.inputContainer}>
                <input
                  type="number"
                  defaultValue={field.defaultValue}
                  style={styles.input}
                />
                <span style={styles.unit}>{field.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </form>

      <button type="submit" style={styles.button}>
        Зберегти
      </button>
    </div>
  );
};

const generatorFields = [
  {
    name: 'Потужність генератора, брутто',
    subscript: 'Generator Gross Capacity',
    unit: 'MWe',
    defaultValue: 100,
  },
  {
    name: 'Коефіцієнт потужності',
    subscript: 'Capacity Factor',
    unit: '%',
    defaultValue: 90,
  },
  {
    name: 'Паразитне навантаження',
    subscript: 'Parasitic Load',
    unit: '%',
    defaultValue: 5,
  },
  {
    name: 'Тривалість функціонування геоТЕС',
    subscript: 'Lifetime',
    unit: 'років',
    defaultValue: 30,
  },
  {
    name: 'Початкова місткість резервуара',
    subscript: 'Initial Reservoir Capacity',
    unit: 'MWe',
    defaultValue: 500,
  },
];

const capitalExpenditureFields = [
  {
    name: 'Вартість буріння свердловини, за кілометр',
    subscript: 'Drilling Per Km',
    unit: '$',
    defaultValue: 1000,
  },
  {
    name: 'Вартість встановлення електростанції',
    subscript: 'Power Plant',
    unit: '$MM',
    defaultValue: 1147,
  },
  {
    name: 'Вартість встановлення cистеми збору',
    subscript: 'Gathering System',
    unit: '$MM',
    defaultValue: 366,
  },
  {
    name: 'Вартість встановлення системи стимуляції резервуарів',
    subscript: 'Stimulation System',
    unit: '$MM',
    defaultValue: 153,
  },
];

const operatingCostFields = [
  {
    name: 'Вартість обслуговування станції',
    subscript: 'Plant O&M',
    unit: '$/KW (рік)',
    defaultValue: 25,
  },
  {
    name: 'Вартість обслуговування родовища',
    subscript: 'Field O&M',
    unit: '$/KW (рік)',
    defaultValue: 30,
  },
];

const styles: { [k in string]: React.CSSProperties } = {
  container: {
    fontFamily: 'Neue Haas Grotesk Text',
    margin: 'auto',
    padding: '20px',
    color: '#333',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  description: {
    fontSize: '16px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  section: {
    padding: '20px 0',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  horizontalDivider: {
    height: '1px',
    backgroundColor: '#ccc',
    width: '100%',
  },
  fieldContainer: {
    marginBottom: '15px',
  },
  label: {
    fontSize: '16px',
    fontWeight: '500',
  },
  subscript: {
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#555',
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '5px',
  },
  input: {
    flex: '1',
    padding: '8px',
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  fileInput: {
    padding: '8px',
    fontSize: '14px',
    display: 'block',
    color: '#fff',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  unit: {
    marginLeft: '10px',
    fontSize: '14px',
    color: '#666',
  },
  button: {
    marginTop: '20px',
    padding: '10px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};
