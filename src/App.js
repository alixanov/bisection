import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Functions as FunctionsIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';

// ==================== ВЫЧИСЛИТЕЛЬНЫЕ МЕТОДЫ ====================

// Парсер математических выражений
const parseExpression = (expression) => {
  try {
    let jsExpression = expression
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/exp/g, 'Math.exp')
      .replace(/ln/g, 'Math.log')
      .replace(/log/g, 'Math.log10')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs');

    return new Function('x', `return ${jsExpression};`);
  } catch (error) {
    throw new Error('Ошибка в синтаксисе математического выражения');
  }
};

// Метод половинного деления (бисекции)
const bisectionMethod = (f, a, b, epsilon, maxIterations = 100) => {
  const iterations = [];
  let iteration = 0;
  let aVal = a;
  let bVal = b;

  if (f(aVal) * f(bVal) >= 0) {
    throw new Error('Функция должна иметь разные знаки на концах отрезка [a, b]');
  }

  while (Math.abs(bVal - aVal) > epsilon && iteration < maxIterations) {
    const c = (aVal + bVal) / 2;
    const fc = f(c);

    iterations.push({
      n: iteration + 1,
      a: aVal.toFixed(6),
      b: bVal.toFixed(6),
      c: c.toFixed(6),
      fc: fc.toFixed(6),
      error: Math.abs(bVal - aVal).toFixed(6)
    });

    if (Math.abs(fc) < epsilon) break;

    if (f(aVal) * fc < 0) {
      bVal = c;
    } else {
      aVal = c;
    }
    iteration++;
  }

  const root = (aVal + bVal) / 2;

  return {
    root: root,
    fRoot: f(root),
    iterations: iterations,
    converged: iteration < maxIterations,
    iterationCount: iteration
  };
};

// Метод хорд (секущих)
const chordMethod = (f, a, b, epsilon, maxIterations = 100) => {
  const iterations = [];
  let iteration = 0;
  let aVal = a;
  let bVal = b;
  let xPrev = a;
  let xCurr;

  if (f(aVal) * f(bVal) >= 0) {
    throw new Error('Функция должна иметь разные знаки на концах отрезка [a, b]');
  }

  while (iteration < maxIterations) {
    const fa = f(aVal);
    const fb = f(bVal);

    xCurr = (aVal * fb - bVal * fa) / (fb - fa);
    const fx = f(xCurr);

    iterations.push({
      n: iteration + 1,
      a: aVal.toFixed(6),
      b: bVal.toFixed(6),
      x: xCurr.toFixed(6),
      fx: fx.toFixed(6),
      error: Math.abs(xCurr - xPrev).toFixed(6)
    });

    if (Math.abs(fx) < epsilon || Math.abs(xCurr - xPrev) < epsilon) {
      break;
    }

    if (f(aVal) * fx < 0) {
      bVal = xCurr;
    } else {
      aVal = xCurr;
    }

    xPrev = xCurr;
    iteration++;
  }

  return {
    root: xCurr,
    fRoot: f(xCurr),
    iterations: iterations,
    converged: iteration < maxIterations,
    iterationCount: iteration + 1
  };
};

// Метод простой итерации
const iterationMethod = (phi, x0, epsilon, maxIterations = 100) => {
  const iterations = [];
  let xPrev = x0;
  let xCurr;
  let iteration = 0;

  while (iteration < maxIterations) {
    xCurr = phi(xPrev);

    iterations.push({
      n: iteration + 1,
      xPrev: xPrev.toFixed(6),
      xCurr: xCurr.toFixed(6),
      error: Math.abs(xCurr - xPrev).toFixed(6)
    });

    if (Math.abs(xCurr - xPrev) < epsilon) {
      break;
    }

    xPrev = xCurr;
    iteration++;
  }

  return {
    root: xCurr,
    iterations: iterations,
    converged: iteration < maxIterations,
    iterationCount: iteration + 1
  };
};

// ==================== ГЛАВНЫЙ КОМПОНЕНТ ====================

const App = () => {
  const [method, setMethod] = useState('bisection');
  const [equation, setEquation] = useState('x^3 - x - 1');
  const [phiEquation, setPhiEquation] = useState('(x + 1)^(1/3)');
  const [a, setA] = useState('1');
  const [b, setB] = useState('2');
  const [x0, setX0] = useState('1.5');
  const [epsilon, setEpsilon] = useState('0.0001');
  const [maxIterations, setMaxIterations] = useState('100');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSolve = () => {
    setError('');
    setResult(null);

    try {
      const eps = parseFloat(epsilon);
      const maxIter = parseInt(maxIterations);

      if (method === 'bisection') {
        const f = parseExpression(equation);
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        const res = bisectionMethod(f, aNum, bNum, eps, maxIter);
        setResult(res);
      } else if (method === 'chord') {
        const f = parseExpression(equation);
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        const res = chordMethod(f, aNum, bNum, eps, maxIter);
        setResult(res);
      } else if (method === 'iteration') {
        const phi = parseExpression(phiEquation);
        const x0Num = parseFloat(x0);
        const res = iterationMethod(phi, x0Num, eps, maxIter);
        setResult(res);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getMethodName = () => {
    switch (method) {
      case 'bisection': return 'Метод половинного деления (бисекции)';
      case 'chord': return 'Метод хорд (секущих)';
      case 'iteration': return 'Метод простой итерации';
      default: return '';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
          <FunctionsIcon sx={{ fontSize: 48 }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Решение нелинейных уравнений
            </Typography>
            <Typography variant="subtitle1">
              Численные методы: бисекция, хорды, итерации
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalculateIcon /> Входные данные
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Численный метод</InputLabel>
                <Select
                  value={method}
                  label="Численный метод"
                  onChange={(e) => setMethod(e.target.value)}
                >
                  <MenuItem value="bisection">Метод половинного деления</MenuItem>
                  <MenuItem value="chord">Метод хорд</MenuItem>
                  <MenuItem value="iteration">Метод итерации</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Уравнение f(x) = 0"
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                sx={{ mb: 2 }}
                helperText="Пример: x^3 - x - 1, sin(x) - 0.5*x, exp(x) - 3*x"
              />

              {method === 'iteration' && (
                <TextField
                  fullWidth
                  label="Итерационная функция φ(x)"
                  value={phiEquation}
                  onChange={(e) => setPhiEquation(e.target.value)}
                  sx={{ mb: 2 }}
                  helperText="Преобразование x = φ(x)"
                />
              )}

              {(method === 'bisection' || method === 'chord') && (
                <>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Левая граница (a)"
                        value={a}
                        onChange={(e) => setA(e.target.value)}
                        type="number"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Правая граница (b)"
                        value={b}
                        onChange={(e) => setB(e.target.value)}
                        type="number"
                      />
                    </Grid>
                  </Grid>
                </>
              )}

              {method === 'iteration' && (
                <TextField
                  fullWidth
                  label="Начальное приближение (x₀)"
                  value={x0}
                  onChange={(e) => setX0(e.target.value)}
                  type="number"
                  sx={{ mb: 2 }}
                />
              )}

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Точность (ε)"
                    value={epsilon}
                    onChange={(e) => setEpsilon(e.target.value)}
                    type="number"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Макс. итераций"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(e.target.value)}
                    type="number"
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShowChartIcon />}
                onClick={handleSolve}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  boxShadow: '0 3px 5px 2px rgba(102, 126, 234, .3)'
                }}
              >
                Решить уравнение
              </Button>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Доступные функции:</strong> sin, cos, tan, exp, ln, log, sqrt, abs, ^ (степень)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <>
              <Card elevation={2} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📊 Результаты вычислений
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Box sx={{ mb: 2 }}>
                    <Chip label={getMethodName()} color="primary" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Уравнение: {equation} = 0
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                        <Typography variant="caption">Корень уравнения</Typography>
                        <Typography variant="h5" fontWeight="bold">
                          x = {result.root?.toFixed(6) || 'N/A'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
                        <Typography variant="caption">Значение f(x)</Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {result.fRoot?.toFixed(8) || 'N/A'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'white' }}>
                        <Typography variant="caption">Число итераций</Typography>
                        <Typography variant="h5" fontWeight="bold">
                          {result.iterationCount}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: result.converged ? 'success.main' : 'error.main', color: 'white' }}>
                        <Typography variant="caption">Статус</Typography>
                        <Typography variant="h6" fontWeight="bold">
                          {result.converged ? '✓ Сходится' : '✗ Не сошёлся'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    📋 Таблица итераций
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {method === 'bisection' && (
                            <>
                              <TableCell><strong>№</strong></TableCell>
                              <TableCell><strong>a</strong></TableCell>
                              <TableCell><strong>b</strong></TableCell>
                              <TableCell><strong>c</strong></TableCell>
                              <TableCell><strong>f(c)</strong></TableCell>
                              <TableCell><strong>|b-a|</strong></TableCell>
                            </>
                          )}
                          {method === 'chord' && (
                            <>
                              <TableCell><strong>№</strong></TableCell>
                              <TableCell><strong>a</strong></TableCell>
                              <TableCell><strong>b</strong></TableCell>
                              <TableCell><strong>x</strong></TableCell>
                              <TableCell><strong>f(x)</strong></TableCell>
                              <TableCell><strong>Погр.</strong></TableCell>
                            </>
                          )}
                          {method === 'iteration' && (
                            <>
                              <TableCell><strong>№</strong></TableCell>
                              <TableCell><strong>x<sub>n-1</sub></strong></TableCell>
                              <TableCell><strong>x<sub>n</sub></strong></TableCell>
                              <TableCell><strong>|x<sub>n</sub> - x<sub>n-1</sub>|</strong></TableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result.iterations.map((iter, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell>{iter.n}</TableCell>
                            {method === 'bisection' && (
                              <>
                                <TableCell>{iter.a}</TableCell>
                                <TableCell>{iter.b}</TableCell>
                                <TableCell>{iter.c}</TableCell>
                                <TableCell>{iter.fc}</TableCell>
                                <TableCell>{iter.error}</TableCell>
                              </>
                            )}
                            {method === 'chord' && (
                              <>
                                <TableCell>{iter.a}</TableCell>
                                <TableCell>{iter.b}</TableCell>
                                <TableCell>{iter.x}</TableCell>
                                <TableCell>{iter.fx}</TableCell>
                                <TableCell>{iter.error}</TableCell>
                              </>
                            )}
                            {method === 'iteration' && (
                              <>
                                <TableCell>{iter.xPrev}</TableCell>
                                <TableCell>{iter.xCurr}</TableCell>
                                <TableCell>{iter.error}</TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          )}

          {!result && !error && (
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <FunctionsIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Введите данные и нажмите "Решить уравнение"
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Результаты вычислений появятся здесь
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          📚 Примеры уравнений для тестирования
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary">Алгебраические:</Typography>
            <Typography variant="body2">• x^3 - x - 1 = 0</Typography>
            <Typography variant="body2">• x^2 - 4*x + 3 = 0</Typography>
            <Typography variant="body2">• x^4 - 5*x^2 + 4 = 0</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary">Трансцендентные:</Typography>
            <Typography variant="body2">• exp(x) - 3*x = 0</Typography>
            <Typography variant="body2">• sin(x) - 0.5*x = 0</Typography>
            <Typography variant="body2">• ln(x) + x^2 - 5 = 0</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="primary">Смешанные:</Typography>
            <Typography variant="body2">• x*exp(x) - cos(x) = 0</Typography>
            <Typography variant="body2">• sin(x) + ln(x) - x = 0</Typography>
            <Typography variant="body2">• x^2 - exp(-x) = 0</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Курсовая работа: Составление пакетной прикладной программы для решения нелинейных уравнений
          <br />
          Выполнил: Алихонов Ш. | Преподаватель: Олимов М. | 2024
        </Typography>
      </Box>
    </Container>
  );
};

export default App;