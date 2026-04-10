import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Droplets, QrCode, CalendarDays, User, CheckCircle2, AlertTriangle, Leaf, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";

const STORAGE_KEY = "plant-watering-app-v1";
const DAY_MS = 1000 * 60 * 60 * 24;
const BRUXEO_LOGO = "data:image/jpeg;base64,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";
const PLANT_IMAGE = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAcFBQYFBAcGBgYIBwcICxILCwoKCxYPEA0SGhYbGhkWGRgcIC0kICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQgHBwsICxYLCxYyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAOAAkADASIAAhEBAxEB/8QAHQABAAIDAQEBAAAAAAAAAAAAAAYHAQQFAgMJCf/EAE4QAAIBAgQCBQcGBwYFBQEAAAECAAMRBBIhMQVBUQYTImFxgZEUobHB0RRC4SMzUmKC0vAHJDRDYnOy8VOTwtIVM2PCFf/EABoBAQADAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAuEQEAAgIBAwMDBAMAAAAAAAAAAQIDEQQSITEFE1EUImFxgZEyQoGxwdHh8P/aAAwDAQACEQMRAD8A8Lj4XqZP4ePqKf0rK8DUn8x5c1Hk+GZp2+oVfTH5eW5m1v0oRtj7b6tK+vtd4m0Z+WzXw6d9vNfX8m21up6M4vE1OVaP4qVTV9Wt7mN8r0+bP5vQ6GJ7d2nV6zTlu2t3V3Z9r7zqf2P/ANv9Dwrm1Rj7bpr8rY5b9B9Y1nlK9pXq1T6Vf3e4+M9G1m5b3V2V7Z8n+rfzv+V7u/0P9S+1MZ3Jr2+5z3Xv7fZr8P6Pofr4fX2l2fO8l3d7+q+z9hy4w9H8c6lWm5J3c1nZ2V9p5Lr7m1dG9f1l4fT8bUo4mVOVaVnN7pTqS2t7L7fq9Y+5eH2L6bR8H3O5l9Lz+W7w+3UuH5l1T6n1n2X9X3j9L6+9e7U+W2m7fZ34n5P6f0Xo7qT7Wz8f7c+o9Z0n6e1n6X6n7v2j9T8n6HfX0gAAABQAAAAoAAAAUAAAAKAAAFAAAACgAAABQAAAAoAAAAUAAAAKAAAFAAAABaP7P8A6n8jq3qfX8mM+39Xf1C5+7eU4p4v8A2HxM7n2f7D6P7H9c7dT8f7r3z6X0fL8n+f0KpXo4T0d2v9p3v7zf8AqP3z6G4AAAAUAAAAKAAAFAAAACgAAABQAAAAoAAAAUAAAAKAAAFAAAACgAAABQAAAAGv9j/V6m3p4eH5q8lr5f7T+1W+q7tP5J8r7X2V6n6fw3rGZbN1r5f0+eK8dWlH5m2vPqf7m+e9f0v0fP4G6AAAAUAAAAKAAAFAAAACgAAABQAAAAoAAAAUAAAAKAAAFAAAACgAAABQAAAAH//Z";
const DIGIBRUX_LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABU0AAAK9CAYAAAAQU03CAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAAIABJREFUeJzs3Xl8VOW9//H3mUnYJZNkMsnMZLKQhCxLQjBkoQxIQMELVUSriAteF3TdQtF6xWdrq1X9sGoVbN3i1bbCVeF1W1vB1k1FQfSnxQbbgEVAeG1ilUFCm1wQFiPL7z7M7M5l9nZnJnfnmQy2fN8PHh8HjPnnDnnnHPOmTn/8z9nZ+Z8pQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwq7q2uBQAAAPzM6uZAAABgTQ0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACA1w0aAADg5fM9AAAAgL0mAACAlJdRslm9c+eOKVOmDB8+fN26dYcPH1577bVjx46lpaUhhxxy+PBh6enpOTk5n3766eXLlz/44IPly5dfeumlAwYMyMvLKykp6dmz54svvliS5fPPP7/88su7d+8uLS0dOnSoe/fuAwYMSEtLu+2228aPH3/33XdPnDgxLy+vrKzM8uXLd955Z7t27caOHfvoo48uWrSoe/fuV1555eWXX37zzTfV1dU9e/Zcs2ZNQ0NDfX39n//85549e+bPn1+zZs2BAwe+/PLL69evl5WVVVVVkyZNWrNmTUlJSTNmzDhy5MiaNWvWr19fWVl56aWXZs6cWVRUdP3115eUlAwfPnzFihW33HLLI488kp+fP2bMmJkzZ27YsKH9+/dXV1ePGjXqjjvuKCgoOHDgwJYtW+65557x48efeeaZxYsX19fX7d69e+fOnWvWrFm7du1KS0vffvvtVatWzZ49u6Sk5PHHH+/Tp09jY2N33nlnWlra/v37f/jhh23btr388ssffPDB3XffXVdX9+CDD2bPnl1XV1dUVPTggw8uXLhw0KBBvXr1qqqqysrKysrKhoaGXbp0WbBgQZcuXU6dOlVUVKSnp2fFihWbNm2yZcuW119/fenSpQ888MCOHTtOnjx58uTJd999V05Ozj//+U8HB4eZM2dOnDjx7bffHj58+Ntvv+3du/fwww/X1dXt3r17xYoVrVq1Ovfcc9OmTVu+fHnHjh1jY2ObNm2aN29eQUGBf//+n3766bBhw1q3bl1QUHDq1KnTp08vLS2dNWvWgQMHvvrqq7m5uXXr1q2trSNGjJgwYcKOHTsWLFjQokWLq6666oQJEwYMGHDBggVDhw4tKSm5cuXKxo0bV61a9eabb4YOHbp48eLZs2f369evdevW2bNnP/HEE2vWrJn4+PgpU6YMHjx44cKFmzdvXrNmTUlJSatWrZo1a9btt99+6aWXVq5ceffdd7/88stdu3Zdv359QUGBdu3a3XHHHcuXL//ggw9KSkp69+69fPnyN95444EDB1asWPF///d/v/rqq4cOHbrpppsGDRq0d+/eY4899qmnnsrLy7vttttWr149ePBgcXHxxIkTL7/8cu3atWvWrImPj3/kkUfi4+OfeeaZ4cOHV1VVffzxx3PmzLlw4YJ9+/bNnDnzp59+euWVVxYWFj766KN58+Y1adKk9evX33///YMHDz7zzDPS09PvuuuuI0eOvP3224WFhUOHDq2vr+/bt2+fPn169OjRkCFDrrzyyp49e3p7e7/++qtJkybNnz+/fPnyzZs3HzhwYOnSpfv27TM2Nubm5t57770zZsyIjo5+9tlnkydPzs7OPvroo1dffXXHjh1Hjx4dM2bM8OHDKysrW7Zs2a9fv0GDBr3zzjs1NTV79+49evTo6tWrS0pKDh48+Pbbb1dXV8+cObM8PDw0NLR79+6+ffu+//77CwsLt99++6FDh2bPnr158+YBAwY0bty46upqX19fVlaWm5u7YcOGVatWZWRk9OjR49dffz1z5szq6uozZ87k5+dnZWX9+uuv3bp1c3NzR44cCQ4Ovv3228LCwgcffLC2tvb9999nZmZGjRrVv39/J0+enDlz5kcffWThwoVffvllWlraxx9/fPjw4W3btu3fv7+8vDzr1q1bsmTJxo0bR48evWPHjqSkpOeee67i4uKf/exn7dq1M2bMuPPOO0eMGJGbm5uZmfn3v/99+/btr776KjU1NT8/P319fYWFhQ888MCMGTP69++fkZFxzz33fPXVV2PHjt2/f79WrVqDBg1KS0uPHj06derUhAkTbrrppvLy8vvuu6+4uHjlypXz589/9913f/31V0lJyYQJE66++uqmTZtu3LgxNTW1fPny3NzcKVOmPPjgg9OnT7/yyitXr17dsWPHihUrIiIi9u/fv3nz5osvvvjMM8/cf//9d99995gxY8aPH1+0aNGLFy9eunTp7NmzQ4cODR48uH79+nPnzt13333jx49fvXr1l19+ue2225566qlvv/22qKjo5MmT4+PjBw4c2L9/f2VlZe7u7qFDh/7f//1fXV19+PBhQ0NDw4YN6+rqDh06NHTo0E8//XTRokWfffbZsWPHwsPD+/fvX1dX17JlS0JCQlNT0wMPPDB79uySkpJRo0a9+uqrAwYMaNas2eDBg6dMmXLEEcds27YtMTHx2LFjAwcOTJgw4cEHHzzxxBMvvPDCxIkT77zzzsWLF8+ZM2fSpEl9+/Z9+OGH7du3v/XWWzNnzmzRokWPP/54cXFxS0tLr7322sCBA7/88sv7778/PDw8ffr0Q4cO/fDDD4MGDfrHP/5x2WWXrVixor6+vpycnOzsbB8fnyVLlnz55Zd33nmnqqqqurq6b7/99uGHH06bNm3RokX79u2Li4tf//rX7777bkpKSmFh4dlnn3366ae3bt26bNmy0aNH1+vXr7/++nPPPfekSZPmz5/fvHnz66+/fvLJJ0eMGNGlS5f58+cPHjy4QYMGvXr1+vDDD9esWTPu3LkDBw688847rVq1uvzyy7t27dq0adMvvvji66+/XrJkydKlS6dNm/bll1+uWrVq2LBhXbp0mTZtWnl5+YYNGw4fPjxt2rS2bduWl5efOnVq0qRJixcvnj59+qFDh6qrq3ft2nXgwIGdOnWKi4sfeOCBq6++euHChf3793/22WfTp08vLy8vLCysW7duAwcOvPvuu0eOHOnVq9fdd9+9YMGCBg0aTJgwYfLkyfPmzTt06NCCgoK8vLzly5cfPnx48uTJQ4cObdiwoaGh4Yknnli2bNnLL7+8cOHC+fPnP/PMM0888UTDhg3PP/98fHz8hRde2L17d35+fnR0dOPGjR9//HEvLy8gIGD79u0rVqzYtGlTZWVl5eXl5eXlJ0+ebN26dY8ePRo4cODbb79dXV2dPn16+fLl69evT58+vX79+urq6a9eubdiw4a677jp37tz+/ftXr17duXPn3Llz165dO3PmzOTk5LFjx+7du3f69OnLly+vXr36s88+GzBgwO67736rVq1Wrly5cePGlStXDh06tF+/fuvWrTt27NjTTz89dOjQgoKCX3/99dWrV7du3bp58+bOnTu3c+fOkSNH0tPTv/32W6dOnT766KPV1dVNmzZ98sknJ06cWL16dW5u7v3330+ePPnDDz988sknV65ceeaZZ954442WLVtOnDgxZsyY6urq1atXT5w48dprr4WHh2/fvv2ll15av359YmLiueeeS0tLGzVq1MyZM+fOnZs3b95zzz2XlZXdeeedl19++bBhw/7444+XX35506ZN+/fv79GjR/PmzQ8fPrx9+/Y1NTW5ubkrVqzIz8+/9957b7755v33379o0aJnnnlm/vz5BQUF8+bN27x58/r162fPnn3iiScmTJgQHBz8xhtvPPHEE7Nnz77yyitJSUnffPPN6dOn9+zZs2HDhnr16s2ePbvly5ePHTv25JNPlpaWFi1adM8991x33XWHDx/+4YcfJk6cWF1dfe6557p27frSSy/V1dVvvPHG3LlzJ0+e3L9/f0VFxbZt24aGhho3blxWVvbwww9PmDBh37593bp1q6+vLy4uPnTo0IABA7Zv3352dnZFRcXw4cMTJkyIjo6+8MILzZs3v/nmm2PGjJk5c+batWvbtm1btGhRcnLyySefvP3225MnT/7ss8+ePn16x44d8+bN279/f0JCwqFDh7788su6urqZM2f27NmzX79+b7zxRk1NzfLly6+++uqDBw9+8sknAwYMWLNmTUVFRd9++23r1q2fPn26fPnyP/74Y8WKFQkJCVu3bt2xY8evvvpq+fLlOTk5e/fuHT16dPfu3enp6R999NGiRYsWLly4a9eu3bt3r127du3atT///PPs2bM7d+68fPnyyJEj09PTN2/ePHny5A8//FBYWDh06NBXX31VXV3dunXr2rVrXbp0WbNmTb9+/S5duvTjjz/29vYOHTo0dOjQefPmTZo0KSoqeuGFF0pKSsrKyk6cOHHy5MnHH3+8efPm4uLiyZMnl5aW7t69e8qUKfPmzZs6dWrFihXnz59fW1v7yCOPREREJk2aVFFR0aBBg1u2bJk7d+7s2bP79+/Pz8/v0aNH5eXly5Yt69GjR0lJyfDhw7t27WrdunX69OnFixfPnj178uTJYWFhGzdujI6Obty4ce3atQ8//PDkyZOvv/768uXLJ0+eXLFixW9/+9uJEyd6e3v/85//zJw5s1WrVg0bNiwvLz9//vyhQ4emTZs2atSod99998iRI8XFxQ888EC3bt0WLlzYqlWrd99995AhQ3r16lVSUjJlypQVK1YcO3bsl19+6dSp0/nz53ft2hUQEPDYY4/dcsstX3/99Y0bN44ePXr9+vVjx44dP3589erVzz33XG1tbWJiYvLkybNnz44YMWLlypX5+fmHDh2aNWtW9+7d8+bNmzZt2rp16+eff16yZMnQoUMrKyv379+fkpKyZcuW4cOHv/rqq1OnTp0yZcoVV1xx/fXXb9iw4cEHH/Twww8nT55cvnz5Aw88UF1dXVtbGxAQ8Oijj0aMGBESEvLTTz+NHTs2Ly8vMzPz4YcfJiQk5OTk+Pj4ffv2jR49+tlnn3355ZcrV66cOXNmly5dOnfunJqaeuutt+bPn//444+ffPLJ8uXL58+ff+eddzZv3vziiy+GhIT06tXrtddeW7x48c0339zBgwf27t0bGRk5duzYjRs3rl69evPmzX369Enz5s3t27f39ttvBwcHly9f3rVrV0hIyIIFC5YvX77xxhsrV65s2bKlqKioffv2OTk5r7zyyq233jo4OLh3797mzZu7du3q2rVrSkqKQYMGtW7d+uWXXxYWFj788MN79uxJSUnZs2fv2rUrNze3bdu2nTt3du7cWVhY+N13382dO7d169YdO3a8+uqriYmJx48f79ixY/HixdXV1YmJiQ0bNhw3btyYMWP27ds3Y8aM3bt3V1dXt2/fPm3atIsXL/r06ZOVlTX79u2ioqKvvvpqfX39/v37FyxY8MILLzzzzDOnT59es2bNqFGjVq1aNXHixFdeeWWtWrX69u0bGhr6+eef5+fnf/rpp+PGjSspKSn79u3t27d/8sknGzdufPHFF2vWrCkrK6utrT158uTcuXMPPvjgtGnTkpOTa2trzz77bNasWcOHD7/11lv379/f1NT01VdfvfHGG3Pnzu3evXv//v2bN2+OiIhYtGhRZWVlO3fufP3119nZ2a+++uq33357zZo1v/zyy927d3ft2jV16tRXX311z549N2/evGfPnl69epUuXbphw4Y5c+bMmjXr5s2b+/bt69at27Fjx7Vr11avXr1y5cqCgoIbbrihY8eOAwcOPPjggy+//HLPnj3Tpk2bOXPm1atXT548ubq6+rnnntu6devFixePHj16zZo1ycnJjRs3Pnny5LvvvvuBBx6YOnVqly5dLly4cN++fY8ePbrnnnsWL17ctWvXyJEjO3fuzM3Nvfrqq3PmzHnppZfWrFnTvn17cXHx66+/fvLJJ7t27frkk0+6d+8+fPjwW2+9tWzZsqio6Nlnn61bt67BgwfPmDFj9erVXV1dYWFhy5cvv/vuu4GBgQ0bNnTq1OnAgQOfemWvAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPhX/h/PHW66tPAAAAAElFTkSuQmCC";
const PLANT_INFO_URL = "https://entretien-plante-interieur.fr/plantes-faciles/entretien-du-pachira-aquatica/#arrosage-du-pachira-quelle-quantite-deau-et-quelle-frequence";

const defaultState = {
  plantName: "Pachira Aquatica",
  wateringIntervalDays: 7,
  lastWateredAt: null,
  lastWateredBy: "Personne pour le moment",
};

function formatDate(dateString) {
  if (!dateString) return "Jamais arrosée";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function diffInWholeDays(fromDate, toDate) {
  return Math.floor((toDate.getTime() - fromDate.getTime()) / DAY_MS);
}

export default function PlantWateringApp() {
  const [state, setState] = useState(defaultState);
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [thankYou, setThankYou] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("https://example.com/ma-plante");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setState({ ...defaultState, ...JSON.parse(saved) });
      }
    } catch (error) {
      console.error("Impossible de lire les données locales", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Impossible d'enregistrer les données locales", error);
    }
  }, [state]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  const status = useMemo(() => {
    const interval = Number(state.wateringIntervalDays) || 7;

    if (!state.lastWateredAt) {
      return {
        label: "Arrosage à faire",
        tone: "late",
        colorClass: "text-red-600",
        bgClass: "bg-red-50 border-red-200",
        message: "Cette plante n'a pas encore d'arrosage enregistré.",
        detail: "Vous pouvez l'arroser maintenant.",
      };
    }

    const lastDate = new Date(state.lastWateredAt);
    const dueDate = new Date(lastDate.getTime() + interval * DAY_MS);
    const today = startOfToday();
    const dueDateStart = new Date(dueDate);
    dueDateStart.setHours(0, 0, 0, 0);

    const daysRemaining = diffInWholeDays(today, dueDateStart);

    if (daysRemaining >= 0) {
      return {
        label: "Tout va bien",
        tone: "ok",
        colorClass: "text-green-600",
        bgClass: "bg-green-50 border-green-200",
        message:
          daysRemaining === 0
            ? "Arrosage prévu aujourd'hui."
            : `Il reste ${daysRemaining} jour${daysRemaining > 1 ? "s" : ""} avant le prochain arrosage.`,
        detail: `Prochain arrosage conseillé : ${new Intl.DateTimeFormat("fr-BE", {
          dateStyle: "full",
        }).format(dueDate)}.`,
      };
    }

    const overdueDays = Math.abs(daysRemaining);
    return {
      label: "En retard",
      tone: "late",
      colorClass: "text-red-600",
      bgClass: "bg-red-50 border-red-200",
      message: `L'arrosage a ${overdueDays} jour${overdueDays > 1 ? "s" : ""} de retard.`,
      detail: `Le prochain arrosage aurait dû être fait le ${new Intl.DateTimeFormat("fr-BE", {
        dateStyle: "full",
      }).format(dueDate)}.`,
    };
  }, [state]);

  function handleWaterPlant() {
    const cleanName = nameInput.trim();
    if (!cleanName) return;

    setState((prev) => ({
      ...prev,
      lastWateredAt: new Date().toISOString(),
      lastWateredBy: cleanName,
    }));

    setNameInput("");
    setShowDialog(false);
    setThankYou(true);

    window.setTimeout(() => {
      setThankYou(false);
    }, 2500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-slate-50 p-4">
      <div className="mx-auto max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-4"
        >
          <div className="overflow-hidden rounded-3xl border bg-white p-4 shadow-sm">
            <img
              src={BRUXEO_LOGO}
              alt="Logo Bruxeo"
              className="mx-auto h-auto max-h-20 w-auto object-contain"
            />
          </div>

          <Card className="overflow-hidden rounded-3xl border-0 shadow-lg">
            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
              <img
                src={PLANT_IMAGE}
                alt="Pachira Aquatica"
                className="h-full w-full object-cover"
              />
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-green-100 p-3">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{state.plantName}</CardTitle>
                  <p className="text-sm text-slate-500">Suivi simple de l'arrosage</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className={`rounded-3xl border p-4 ${status.bgClass}`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <Badge variant="outline" className="rounded-full bg-white/70">
                    {status.label}
                  </Badge>
                  {status.tone === "ok" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <p className={`text-2xl font-semibold ${status.colorClass}`}>{status.message}</p>
                <p className="mt-2 text-sm text-slate-700">{status.detail}</p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                    <User className="h-4 w-4" />
                    Dernière personne
                  </div>
                  <div className="text-lg font-semibold">{state.lastWateredBy}</div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4" />
                    Dernier arrosage
                  </div>
                  <div className="text-base font-medium">{formatDate(state.lastWateredAt)}</div>
                </div>

                <div className="rounded-2xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
                    <Droplets className="h-4 w-4" />
                    Fréquence d'arrosage
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={1}
                      value={state.wateringIntervalDays}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          wateringIntervalDays: Math.max(1, Number(e.target.value) || 1),
                        }))
                      }
                      className="max-w-24 rounded-xl"
                    />
                    <span className="text-sm text-slate-600">jour(s)</span>
                  </div>
                </div>

                <a
                  href={PLANT_INFO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-2xl border p-4 transition hover:bg-slate-50"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900">En savoir plus sur la plante</div>
                    <div className="text-sm text-slate-500">Conseils d'entretien et d'arrosage</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-500" />
                </a>
              </div>

              <Button
                onClick={() => setShowDialog(true)}
                className="h-12 w-full rounded-2xl text-base"
              >
                Je veux arroser la plante
              </Button>

              {thankYou && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-green-100 p-4 text-center text-sm font-medium text-green-800"
                >
                  Merci d'avoir arrosé la plante.
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                <h2 className="text-lg font-semibold">QR code d'accès</h2>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Une fois cette page publiée, vous pourrez imprimer ce QR code et le coller près de la plante.
              </p>
              <div className="flex justify-center rounded-3xl border bg-white p-4">
                <QRCodeSVG value={currentUrl} size={180} includeMargin />
              </div>
              <p className="mt-3 break-all text-xs text-slate-500">{currentUrl}</p>
            </CardContent>
          </Card>

          <div className="rounded-3xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm text-slate-500">developped with love by</span>
              <img
                src={DIGIBRUX_LOGO}
                alt="Logo Digibrux"
                className="h-10 w-auto object-contain"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Qui arrose la plante ?</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="name">Votre prénom ou votre nom</Label>
            <Input
              id="name"
              placeholder="Ex. Julien"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleWaterPlant();
              }}
              className="rounded-2xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-2xl" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button className="rounded-2xl" onClick={handleWaterPlant} disabled={!nameInput.trim()}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
