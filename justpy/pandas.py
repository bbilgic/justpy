from .htmlcomponents import *
from .chartcomponents import *
from .gridcomponents import *
from addict import Dict
from io import StringIO

try:
    import pandas as pd
    _has_pandas = True
except:
    _has_pandas = False


# https://pandas.pydata.org/pandas-docs/stable/development/extending.html
if _has_pandas:

    @pd.api.extensions.register_dataframe_accessor("jp")
    class JustPyAccessor:
        def __init__(self, df, **kwargs):
            self._validate(df)
            self.df = df

        @staticmethod
        def _validate(obj):
            pass

        @staticmethod
        def make_pairs_list(x_data, y_data):
            return list(map(list, itertools.zip_longest(x_data, y_data)))

        def _get_column(self, col_spec):
            if isinstance(col_spec, int):
                col = self.df.iloc[:, col_spec]
            elif isinstance(col_spec, str):
                col = self.df[col_spec]
            else:
                raise TypeError('Column specification for plotting must be integer or string')
            col = col.replace([np.inf, -np.inf], [sys.float_info.max, -sys.float_info.max])
            # Convert nan to None
            return col.where((pd.notnull(col)), None)

        def plot(self, x, y, **kwargs):
            kind = kwargs.get('kind', 'column')
            chart = HighCharts(**kwargs)
            categories = kwargs.get('categories', True)
            o = chart.options
            o.chart.type = kind
            o.chart.zoomType = 'xy'
            o.chart.panning = True
            o.chart.panKey = 'shift'
            o.title.text = kwargs.get('title', '')
            o.subtitle.text = kwargs.get('subtitle', '')
            o.plotOptions.series.stacking = kwargs.get('stacking', '')  # either normal or percent
            if kind not in ['scatter'] and categories:
                o.xAxis.categories = list(self._get_column(x))
            o.series = []
            for col in y:
                s = Dict()
                if kind not in ['scatter'] and categories:
                    s.data = list(self._get_column(col))
                else:
                    s.data = self.make_pairs_list(self._get_column(x),self._get_column(col))
                s.name = self.df.columns[col] if isinstance(col, int) else col
                s.type = kind
                o.series.append(s)
            return chart

        def ag_grid(self, **kwargs):
            grid = AgGrid(**kwargs)
            grid.load_pandas_frame(self.df)
            return grid

        def table(self, **kwargs):
            headers = list(self.df.columns)
            table_data = self.df.to_numpy().tolist()
            table_data.insert(0, headers)
            return(AutoTable(values=table_data, **kwargs))

    def read_csv_from_string(csv_string, *args):
        return pd.read_csv(StringIO(csv_string), *args)
