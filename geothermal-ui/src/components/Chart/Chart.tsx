import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useRecoilValue } from 'recoil';
import { CircularProgress, Typography } from '@mui/material';
import { DatasetSelector, LoadingState } from '../../store/store';
import { CustomDot } from './components/CustomDot';

import './Chart.css';

export function Chart() {
  const datasets = useRecoilValue(DatasetSelector);
  const loading = useRecoilValue(LoadingState);

  return (
    <div className='contentContainer'>
      <Typography className='YAxisLabel' fontWeight="bold">LCOE ($/MWh)</Typography>
      <Typography 
        className='XAxisLabel' 
        fontWeight="bold"
      >Температура ( °C)</Typography>
      <ResponsiveContainer className="chartContainer">
        <LineChart> 
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="temperature"
            type="number"
            domain={[0, 500]}
            minTickGap={0}
            ticks={[0, 100, 200, 300, 400, 500]}
            allowDataOverflow={true}
          />
          <YAxis
            dataKey="lcoe"
            className='YAxis'
            minTickGap={0}
            type="number"
            domain={[0, 200]}
            ticks={[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200]}
            allowDataOverflow={true}
          />
          {datasets.map((data, index) => (
            <Line
              key={index}
              type="monotone"
              stroke={data.chartColor}
              strokeWidth={3}
              dataKey="lcoe"
              data={data.data}
              name={`Line ${index + 1}`}
              dot={<CustomDot />}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {loading && <CircularProgress size={60} className='loadingStatus' color='primary' />}
    </div>
  )
}
