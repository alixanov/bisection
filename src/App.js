import React, { useState, useMemo } from 'react';
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
  ShowChart as ShowChartIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon
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

    const func = new Function('x', `return ${jsExpression};`);
    // Проверяем, что функция работает
    func(1);
    return func;
  } catch (error) {
    throw new Error('Неправильный синтаксис математического выражения');
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

// ==================== КОМПОНЕНТ ГРАФИКА ====================

const FunctionPlot = ({ equation, root, a, b, method }) => {
  const canvasRef = React.useRef(null);

  React.useEffect(() => {
    if (!canvasRef.current || !equation) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Очистка canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    try {
      const f = parseExpression(equation);

      // Определение диапазона
      let xMin, xMax;
      if (method === 'iteration') {
        xMin = root - 2;
        xMax = root + 2;
      } else {
        xMin = parseFloat(a);
        xMax = parseFloat(b);
      }

      const padding = Math.abs(xMax - xMin) * 0.2;
      xMin -= padding;
      xMax += padding;

      // Вычисление значений функции
      const points = [];
      let yMin = Infinity;
      let yMax = -Infinity;

      for (let i = 0; i <= width; i++) {
        const x = xMin + (xMax - xMin) * (i / width);
        try {
          const y = f(x);
          if (isFinite(y)) {
            points.push({ x, y });
            yMin = Math.min(yMin, y);
            yMax = Math.max(yMax, y);
          }
        } catch (e) {
          // Пропускаем точки, где функция не определена
        }
      }

      if (points.length === 0) return;

      // Добавление отступов по Y
      const yPadding = Math.abs(yMax - yMin) * 0.2;
      yMin -= yPadding;
      yMax += yPadding;

      // Функции преобразования координат
      const xToCanvas = (x) => ((x - xMin) / (xMax - xMin)) * width;
      const yToCanvas = (y) => height - ((y - yMin) / (yMax - yMin)) * height;

      // Рисуем сетку
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = xMin + (xMax - xMin) * (i / 10);
        const canvasX = xToCanvas(x);
        ctx.beginPath();
        ctx.moveTo(canvasX, 0);
        ctx.lineTo(canvasX, height);
        ctx.stroke();

        const y = yMin + (yMax - yMin) * (i / 10);
        const canvasY = yToCanvas(y);
        ctx.beginPath();
        ctx.moveTo(0, canvasY);
        ctx.lineTo(width, canvasY);
        ctx.stroke();
      }

      // Рисуем оси
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;

      // Ось X
      if (yMin <= 0 && yMax >= 0) {
        const y0 = yToCanvas(0);
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.lineTo(width, y0);
        ctx.stroke();
      }

      // Ось Y
      if (xMin <= 0 && xMax >= 0) {
        const x0 = xToCanvas(0);
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        ctx.lineTo(x0, height);
        ctx.stroke();
      }

      // Рисуем график функции
      ctx.strokeStyle = '#2196f3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      let started = false;

      for (const point of points) {
        const canvasX = xToCanvas(point.x);
        const canvasY = yToCanvas(point.y);

        if (!started) {
          ctx.moveTo(canvasX, canvasY);
          started = true;
        } else {
          ctx.lineTo(canvasX, canvasY);
        }
      }
      ctx.stroke();

      // Отмечаем корень
      if (root !== null && root !== undefined) {
        const rootX = xToCanvas(root);
        const rootY = yToCanvas(f(root));

        // Красная точка для корня
        ctx.fillStyle = '#f44336';
        ctx.beginPath();
        ctx.arc(rootX, rootY, 6, 0, 2 * Math.PI);
        ctx.fill();

        // Вертикальная линия от корня к оси X
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.lineTo(rootX, yToCanvas(0));
        ctx.stroke();
        ctx.setLineDash([]);

        // Подпись корня
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`x = ${root.toFixed(4)}`, rootX + 10, rootY - 10);
      }

      // Подписи осей
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.fillText(`x: [${xMin.toFixed(2)}, ${xMax.toFixed(2)}]`, 10, height - 10);
      ctx.fillText(`y: [${yMin.toFixed(2)}, ${yMax.toFixed(2)}]`, 10, 20);

    } catch (error) {
      console.error('Ошибка при построении графика:', error);
    }
  }, [equation, root, a, b, method]);

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        style={{ border: '1px solid #e0e0e0', borderRadius: '8px', maxWidth: '100%' }}
      />
    </Box>
  );
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

  const validateInputs = () => {
    const errors = [];

    // Проверка уравнения
    if (!equation.trim()) {
      errors.push({
        field: 'Уравнение',
        message: 'Поле не может быть пустым',
        example: 'Пример: x^3 - x - 1'
      });
    } else {
      try {
        const f = parseExpression(equation);
        f(1); // Проверяем, что функция работает
      } catch (e) {
        errors.push({
          field: 'Уравнение',
          message: 'Неправильный синтаксис',
          example: 'Правильно: x^3 - x - 1\nНеправильно: x³ - х - 1'
        });
      }
    }

    // Проверка параметров метода
    if (method === 'bisection' || method === 'chord') {
      const aNum = parseFloat(a);
      const bNum = parseFloat(b);

      if (isNaN(aNum)) {
        errors.push({
          field: 'Левая граница (a)',
          message: 'Должно быть числом',
          example: 'Правильно: 1 или -2.5\nНеправильно: abc или пусто'
        });
      }

      if (isNaN(bNum)) {
        errors.push({
          field: 'Правая граница (b)',
          message: 'Должно быть числом',
          example: 'Правильно: 2 или 3.5\nНеправильно: xyz или пусто'
        });
      }

      if (!isNaN(aNum) && !isNaN(bNum) && aNum >= bNum) {
        errors.push({
          field: 'Границы отрезка',
          message: 'a должно быть меньше b',
          example: 'Правильно: a=1, b=2\nНеправильно: a=2, b=1'
        });
      }
    }

    if (method === 'iteration') {
      if (!phiEquation.trim()) {
        errors.push({
          field: 'Итерационная функция',
          message: 'Поле не может быть пустым',
          example: 'Пример: (x + 1)^(1/3)'
        });
      } else {
        try {
          const phi = parseExpression(phiEquation);
          phi(1);
        } catch (e) {
          errors.push({
            field: 'Итерационная функция',
            message: 'Неправильный синтаксис',
            example: 'Правильно: (x + 1)^(1/3)\nНеправильно: ∛(x + 1)'
          });
        }
      }

      const x0Num = parseFloat(x0);
      if (isNaN(x0Num)) {
        errors.push({
          field: 'Начальное приближение (x₀)',
          message: 'Должно быть числом',
          example: 'Правильно: 1.5\nНеправильно: abc'
        });
      }
    }

    // Проверка точности
    const epsNum = parseFloat(epsilon);
    if (isNaN(epsNum) || epsNum <= 0) {
      errors.push({
        field: 'Точность (ε)',
        message: 'Должно быть положительным числом',
        example: 'Правильно: 0.0001 или 0.001\nНеправильно: -0.01 или 0'
      });
    }

    // Проверка максимального числа итераций
    const maxIter = parseInt(maxIterations);
    if (isNaN(maxIter) || maxIter <= 0) {
      errors.push({
        field: 'Максимальное число итераций',
        message: 'Должно быть положительным целым числом',
        example: 'Правильно: 100\nНеправильно: -10 или 0'
      });
    }

    return errors;
  };

  const handleSolve = () => {
    setError('');
    setResult(null);

    // Валидация входных данных
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(err =>
        `❌ ${err.field}: ${err.message}\n${err.example}`
      ).join('\n\n');
      setError(errorMessage);
      return;
    }

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
      setError(`❌ Ошибка вычисления: ${err.message}\n\n💡 Совет: Проверьте правильность ввода данных и условия применимости метода`);
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
        <Grid item xs={12} md={4}>
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
                helperText="Пример: x^3 - x - 1"
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
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Правая граница (b)"
                        value={b}
                        onChange={(e) => setB(e.target.value)}
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
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Макс. итераций"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(e.target.value)}
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
                  <strong>Доступные функции:</strong><br />
                  sin, cos, tan, exp, ln, log, sqrt, abs<br />
                  ^ (степень)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2, whiteSpace: 'pre-line' }}
              icon={<ErrorIcon />}
            >
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

              <Card elevation={2} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShowChartIcon /> График функции
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <FunctionPlot
                    equation={equation}
                    root={result.root}
                    a={a}
                    b={b}
                    method={method}
                  />
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default App;